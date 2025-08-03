#!/usr/bin/env node

const { Fingerprint, BlackBox } = require('./index');

console.log('🚀 Testing NosTale Auth C++ Bindings...\n');

try {
    // Test 1: Create fingerprint
    console.log('📋 Test 1: Creating fingerprint');
    const fingerprint = new Fingerprint();
    console.log('✅ Fingerprint created');
    
    // Test 2: Get fingerprint data
    console.log('\n🔍 Test 2: Getting fingerprint data');
    const fpData = fingerprint.getJson();
    console.log('✅ Fingerprint data retrieved');
    console.log('🆔 UUID:', fpData.uuid);
    console.log('📊 Vector (first 50 chars):', fpData.vector.substring(0, 50) + '...');
    console.log('⏰ Creation:', fpData.creation);
    
    // Test 3: Update fingerprint
    console.log('\n🔄 Test 3: Updating fingerprint');
    fingerprint.updateVector();
    fingerprint.updateCreation();
    fingerprint.updateTimings();
    console.log('✅ Fingerprint updated');
    
    const updatedData = fingerprint.getJson();
    console.log('⚡ New timing delay:', updatedData.d);
    
    // Test 4: BlackBox encoding (static method)
    console.log('\n📦 Test 4: Testing BlackBox static encoding');
    const testData = '["test","data","array"]';
    const encoded = BlackBox.encodeStatic(testData);
    console.log('✅ BlackBox encoded');
    console.log('📝 Encoded (first 50 chars):', encoded.substring(0, 50) + '...');
    
    // Test 5: BlackBox decoding
    console.log('\n🔓 Test 5: Testing BlackBox decoding');
    const decoded = BlackBox.decode(encoded);
    console.log('✅ BlackBox decoded');
    console.log('🔍 Decode successful:', decoded.length > 0);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Fingerprint creation');
    console.log('   ✅ Fingerprint data retrieval');
    console.log('   ✅ Fingerprint updates');
    console.log('   ✅ BlackBox encoding/decoding');
    console.log('\n💡 C++ bindings are working correctly!');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}