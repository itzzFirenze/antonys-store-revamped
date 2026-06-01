const supabase = require('../supabase');
const bcrypt = require('bcryptjs');

// ─── Field mapping ────────────────────────────────────────────────────────────
// Maps Supabase snake_case columns → camelCase response keys expected by frontend

function toClientShape(row) {
   if (!row) return null;
   return {
      _id:       row.id,
      name:      row.name,
      email:     row.email,
      mobNum:    row.mob_num,
      address:   row.address,
      pincode:   row.pincode,
      isAdmin:   row.is_admin,
      createdAt: row.created_at,
   };
}

// ─── Password helpers ─────────────────────────────────────────────────────────

async function hashPassword(plaintext) {
   const salt = await bcrypt.genSalt(10);
   return bcrypt.hash(plaintext, salt);
}

async function matchPassword(plaintext, hash) {
   return bcrypt.compare(plaintext, hash);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function findByEmail(email, { includePassword = false } = {}) {
   let query = supabase.from('users').select('*').eq('email', email).maybeSingle();
   const { data, error } = await query;
   if (error) throw error;
   if (!data) return null;
   if (!includePassword) delete data.password;
   return data;
}

async function findById(id, { includePassword = false } = {}) {
   const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
   if (error) throw error;
   if (!data) return null;
   if (!includePassword) delete data.password;
   return data;
}

async function create({ name, email, password }) {
   const hashedPassword = await hashPassword(password);
   const { data, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword })
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function update(id, fields) {
   // Map camelCase input fields to snake_case columns
   const dbFields = {};
   if (fields.name      !== undefined) dbFields.name      = fields.name;
   if (fields.email     !== undefined) dbFields.email     = fields.email;
   if (fields.mobNum    !== undefined) dbFields.mob_num   = fields.mobNum;
   if (fields.address   !== undefined) dbFields.address   = fields.address;
   if (fields.pincode   !== undefined) dbFields.pincode   = fields.pincode;
   if (fields.isAdmin   !== undefined) dbFields.is_admin  = fields.isAdmin;
   if (fields.is_admin  !== undefined) dbFields.is_admin  = fields.is_admin;
   if (fields.password  !== undefined) {
      dbFields.password = await hashPassword(fields.password);
   }
   // Reset code fields (used internally, already snake_case from callers)
   if (fields.reset_code         !== undefined) dbFields.reset_code         = fields.reset_code;
   if (fields.reset_code_expires !== undefined) dbFields.reset_code_expires = fields.reset_code_expires;

   const { data, error } = await supabase
      .from('users')
      .update(dbFields)
      .eq('id', id)
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function deleteById(id) {
   const { error } = await supabase.from('users').delete().eq('id', id);
   if (error) throw error;
}

async function findAll() {
   const { data, error } = await supabase
      .from('users')
      .select('id, name, email, is_admin, created_at')
      .order('created_at', { ascending: false });
   if (error) throw error;
   return data;
}

async function findByResetCode(email, resetCode) {
   const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('reset_code', resetCode)
      .gt('reset_code_expires', new Date().toISOString())
      .maybeSingle();
   if (error) throw error;
   return data;
}

module.exports = {
   toClientShape,
   hashPassword,
   matchPassword,
   findByEmail,
   findById,
   create,
   update,
   deleteById,
   findAll,
   findByResetCode,
};
