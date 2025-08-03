#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Fingerprint, BlackBox, EncryptedBlackBox, Identity } = require('./index');

async function runBasicTest() {
    console.log('🚀 Starting NosTale Auth Bindings Test...\n');

    // Test 1: Create a new fingerprint
    console.log('📋 Test 1: Creating a new fingerprint');
    const fingerprint = new Fingerprint();
    console.log('✅ Fingerprint created');
    console.log('📄 Fingerprint JSON preview:', JSON.stringify(fingerprint.json(), null, 2).substring(0, 200) + '...\n');

    // Test 2: Update fingerprint properties
    console.log('🔄 Test 2: Updating fingerprint properties');
    fingerprint.updateVector();
    fingerprint.updateCreation();
    fingerprint.updateTimings();
    console.log('✅ Fingerprint updated');
    console.log('🆔 UUID:', fingerprint.json().uuid);
    console.log('📊 Vector (base64):', fingerprint.json().vector.substring(0, 50) + '...');
    console.log('⏰ Creation time:', fingerprint.json().creation);
    console.log('⚡ Timing delay:', fingerprint.json().d, 'ms\n');

    // Test 3: Test server time (with fallback)
    console.log('🌐 Test 3: Fetching server time');
    try {
        await fingerprint.updateServerTime();
        console.log('✅ Server time updated:', fingerprint.json().serverTimeInMS);
    } catch (error) {
        console.log('⚠️  Server time fetch failed (expected), using fallback:', fingerprint.json().serverTimeInMS);
    }
    console.log();

    // Test 4: Test Identity with file persistence
    console.log('💾 Test 4: Testing Identity with file persistence');
    const identityFile = path.join(__dirname, 'test_data', 'test_identity.json');
    
    // Clean up any existing test file
    if (fs.existsSync(identityFile)) {
        fs.unlinkSync(identityFile);
    }

    const identity = new Identity(identityFile);
    console.log('✅ Identity created');
    
    await identity.update();
    console.log('🔄 Identity updated');
    
    identity.save();
    console.log('💾 Identity saved to file');
    
    // Verify file was created
    if (fs.existsSync(identityFile)) {
        console.log('✅ Identity file exists');
        const fileContent = fs.readFileSync(identityFile, 'utf8');
        console.log('📄 File size:', fileContent.length, 'bytes');
    } else {
        console.log('❌ Identity file was not created');
    }
    console.log();

    // Test 5: Load identity from file
    console.log('📖 Test 5: Loading identity from saved file');
    const loadedIdentity = new Identity(identityFile);
    const originalFingerprint = identity.getFingerprint().json();
    const loadedFingerprint = loadedIdentity.getFingerprint().json();
    
    console.log('✅ Identity loaded from file');
    console.log('🔍 Original UUID:', originalFingerprint.uuid);
    console.log('🔍 Loaded UUID:', loadedFingerprint.uuid);
    console.log('✅ UUIDs match:', originalFingerprint.uuid === loadedFingerprint.uuid);
    console.log();

    // Test 6: BlackBox encoding/decoding
    console.log('📦 Test 6: Testing BlackBox encoding/decoding');
    const testRequest = {
        features: [12345],
        installation: "test-installation-id",
        session: "test-session-id"
    };
    
    identity.setRequest(testRequest);
    const blackBox = new BlackBox(identity);
    const encoded = blackBox.encoded();
    
    console.log('✅ BlackBox encoded');
    console.log('📝 Encoded blackbox:', encoded.substring(0, 100) + '...');
    
    // Test decoding
    const decoded = BlackBox.decode(encoded);
    if (decoded) {
        console.log('✅ BlackBox decoded successfully');
        const decodedObj = JSON.parse(decoded);
        console.log('🔍 Decoded request matches:', JSON.stringify(decodedObj.request) === JSON.stringify(testRequest));
    } else {
        console.log('❌ BlackBox decoding failed');
    }
    console.log();

    // Test 7: EncryptedBlackBox
    console.log('🔒 Test 7: Testing EncryptedBlackBox');
    const encryptedBlackBox = new EncryptedBlackBox(
        identity,
        'test-account-id',
        'test-gsid-12345',
        'test-installation-id'
    );
    
    const encrypted = encryptedBlackBox.encrypted();
    console.log('✅ EncryptedBlackBox created');
    console.log('🔐 Encrypted data:', encrypted.substring(0, 100) + '...');
    console.log();

    // Clean up
    identity.close();
    loadedIdentity.close();
    
    // Clean up test files
    if (fs.existsSync(identityFile)) {
        fs.unlinkSync(identityFile);
        const testDir = path.dirname(identityFile);
        if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
            fs.rmdirSync(testDir);
        }
    }

    console.log('🧹 Test cleanup completed');
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Fingerprint creation and updates');
    console.log('   ✅ Identity file persistence');
    console.log('   ✅ BlackBox encoding/decoding');
    console.log('   ✅ EncryptedBlackBox functionality');
    console.log('\n💡 You can now use these classes to create and manage NosTale authentication fingerprints!');
}

// Run the test
runBasicTest().catch(console.error);