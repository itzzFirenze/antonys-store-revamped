const supabase = require('../supabase');

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Insert or replace a verification code for an email.
 * Mirrors Mongoose: Verification.findOneAndUpdate({ email }, { ... }, { upsert: true })
 */
async function upsert(email, code, expiresAt) {
   // Delete any existing record for this email first, then insert fresh
   await supabase.from('verification_codes').delete().eq('email', email);

   const { data, error } = await supabase
      .from('verification_codes')
      .insert({
         email,
         code,
         expires_at: new Date(expiresAt).toISOString(),
      })
      .select()
      .single();
   if (error) throw error;
   return data;
}

/**
 * Find a valid (non-expired) verification record matching email + code.
 * Mirrors Mongoose: Verification.findOne({ email, code, expiresAt: { $gt: Date.now() } })
 */
async function findValid(email, code) {
   const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
   if (error) throw error;
   return data;
}

/**
 * Delete a verification record by its UUID.
 */
async function deleteById(id) {
   const { error } = await supabase
      .from('verification_codes')
      .delete()
      .eq('id', id);
   if (error) throw error;
}

module.exports = { upsert, findValid, deleteById };
