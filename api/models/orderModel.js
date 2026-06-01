const supabase = require('../supabase');

// ─── Field mapping ────────────────────────────────────────────────────────────

function toClientShape(row) {
   if (!row) return null;
   const result = {
      _id:               row.id,
      orderId:           row.order_id,
      userId:            row.user_id,
      productId:         row.product_id,
      size:              row.size,
      isPending:         row.is_pending,
      isCompleted:       row.is_completed,
      isReqPayment:      row.is_req_payment,
      address:           row.address,
      pincode:           row.pincode,
      phoneNumber:       row.phone_number,
      additionalDetails: row.additional_details,
      wantStitched:      row.want_stitched,
      length:            row.length,
      chest:             row.chest,
      waist:             row.waist,
      hip:               row.hip,
      armFit:            row.arm_fit,
      sleeveLength:      row.sleeve_length,
      sleeveWidth:       row.sleeve_width,
      backNeck:          row.back_neck,
      frontNeck:         row.front_neck,
      approvedAt:        row.approved_at,
      paymentRequestedAt: row.payment_requested_at,
      createdAt:         row.created_at,
      updatedAt:         row.updated_at,
      // Populated relations (from joins)
      user:              row.user    ? { name: row.user.name, email: row.user.email } : undefined,
      product:           row.product || undefined,
   };

   // If manual order with customer details stored in additional_details
   try {
      if (typeof row.additional_details === 'string' && row.additional_details.startsWith('{')) {
         const parsed = JSON.parse(row.additional_details);
         if (parsed.customerName) {
            result.user = { name: parsed.customerName, email: parsed.customerEmail || 'N/A' };
            result.additionalDetails = parsed.additionalDetails || '';
         }
         if (parsed.orderItems) {
            result.orderItems = parsed.orderItems;
         }
      }
   } catch(e) {}

   return result;
}

// ─── Order ID Generation ──────────────────────────────────────────────────────
// Format: ANTY{YYYYMMDD}{4-digit-seq} — mirrors Mongoose pre-save hook

async function generateOrderId() {
   const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
   const prefix = `ANTY${currentDate}`;

   const { data, error } = await supabase
      .from('orders')
      .select('order_id')
      .like('order_id', `${prefix}%`)
      .order('order_id', { ascending: false })
      .limit(1)
      .maybeSingle();

   if (error) throw error;

   const latestNumber = data?.order_id ? parseInt(data.order_id.slice(12), 10) : 0;
   return `${prefix}${(latestNumber + 1).toString().padStart(4, '0')}`;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function create(fields) {
   const orderId = await generateOrderId();

   const { data, error } = await supabase
      .from('orders')
      .insert({
         order_id:           orderId,
         user_id:            fields.userId,
         product_id:         fields.productId,
         size:               fields.size || null,
         address:            fields.address,
         pincode:            fields.pincode,
         phone_number:       fields.phoneNumber,
         additional_details: fields.additionalDetails || '',
         want_stitched:      fields.wantStitched || false,
         is_pending:         true,
         length:             fields.length === "" ? null : fields.length,
         chest:              fields.chest === "" ? null : fields.chest,
         waist:              fields.waist === "" ? null : fields.waist,
         hip:                fields.hip === "" ? null : fields.hip,
         arm_fit:            fields.armFit === "" ? null : fields.armFit,
         sleeve_length:      fields.sleeveLength === "" ? null : fields.sleeveLength,
         sleeve_width:       fields.sleeveWidth === "" ? null : fields.sleeveWidth,
         back_neck:          fields.backNeck === "" ? null : fields.backNeck,
         front_neck:         fields.frontNeck === "" ? null : fields.frontNeck,
      })
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function findAll() {
   const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
   if (error) throw error;
   return data;
}

async function findByUserId(userId) {
   const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
   if (error) throw error;
   return data;
}

async function findById(id) {
   // Join with users and products tables to replicate Mongoose populate()
   const { data, error } = await supabase
      .from('orders')
      .select(`
         *,
         user:users ( name, email ),
         product:products ( * )
      `)
      .eq('id', id)
      .maybeSingle();
   if (error) throw error;
   return data;
}

async function update(id, fields) {
   const { data, error } = await supabase
      .from('orders')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function deleteById(id) {
   const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
   if (error) throw error;
   return data;
}

async function countWhere(filters) {
   let query = supabase.from('orders').select('*', { count: 'exact', head: true });
   for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
   }
   const { count, error } = await query;
   if (error) throw error;
   return count;
}

module.exports = {
   toClientShape,
   create,
   findAll,
   findByUserId,
   findById,
   update,
   deleteById,
   countWhere,
};
