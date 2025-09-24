#!/usr/bin/env node

/**
 * Test Supabase connection directly
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://octeimxcjfbrevrwrssz.supabase.co';
const supabasePublishableKey = 'sb_publishable_Rg_QCtLKzJiDg36epLOong_-rTbyhQN';

console.log('🧪 Testing Supabase connection...\n');

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function testSupabase() {
  try {
    console.log('1️⃣ Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error:', error);
      return;
    }
    
    console.log('   ✅ Connection successful');
    console.log('   📊 Found', data.length, 'conversations');
    
    console.log('\n2️⃣ Testing conversation creation...');
    
    // Test creating a conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_id: 'test-user',
        title: 'Test Conversation from Node.js',
        metadata: { test: true }
      })
      .select()
      .single();
    
    if (createError) {
      console.log('   ❌ Create error:', createError);
      return;
    }
    
    console.log('   ✅ Conversation created successfully');
    console.log('   📝 ID:', newConv.id);
    console.log('   📝 Title:', newConv.title);
    
    console.log('\n🎉 All Supabase tests passed!');
    
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
    console.log('   📋 Error details:', error);
  }
}

testSupabase();
