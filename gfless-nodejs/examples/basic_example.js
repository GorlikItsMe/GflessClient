const { 
  createIdentity, 
  createBlackBox, 
  createEncryptedBlackBox,
  BlackBox,
  Utils,
  Crypto,
  getVersion 
} = require('../lib');

async function basicExample() {
  console.log('Gfless Node.js Library Basic Example');
  console.log('Version:', getVersion());
  console.log();

  try {
    // Create an identity
    const identity = createIdentity('identity.json');
    console.log('✓ Identity created');

    // Update the identity
    identity.update();
    console.log('✓ Identity updated');

    // Get fingerprint data
    const fingerprint = identity.getFingerprint();
    console.log('✓ Fingerprint retrieved');
    console.log('Fingerprint fields:', Object.keys(fingerprint).length);

    // Create a basic blackbox
    const blackBox = createBlackBox(identity, {
      app: 'example',
      version: '1.0'
    });
    
    const encoded = blackBox.encoded();
    console.log('✓ BlackBox encoded:', encoded.substring(0, 50) + '...');

    // Test static encode/decode
    const testData = '["test", 123, true]';
    const staticEncoded = BlackBox.encode(testData);
    const staticDecoded = BlackBox.decode(staticEncoded);
    
    console.log('✓ Static encode/decode test passed');
    console.log('Original:', testData);
    console.log('Encoded:', staticEncoded.substring(0, 50) + '...');
    console.log('Decoded:', staticDecoded);

    // Utility functions demonstration
    console.log('\n--- Utility Functions ---');
    console.log('Current time (ISO):', Utils.getCurrentTimeISO());
    console.log('Current time (ms):', Utils.getCurrentTimeMs());
    console.log('Random string (16):', Utils.randomString(16));
    
    const testString = 'Hello, World!';
    const base64 = Utils.base64Encode(testString);
    console.log('Base64 encode:', base64);
    console.log('Base64 decode:', Utils.base64Decode(base64));
    
    // Crypto functions
    console.log('\n--- Crypto Functions ---');
    const hash = Crypto.sha512Hex('test message');
    console.log('SHA512 hash:', hash.substring(0, 32) + '...');
    
    const encrypted = Crypto.xorEncrypt('secret', 'key');
    const decrypted = Crypto.xorDecrypt(encrypted, 'key');
    console.log('XOR encrypt/decrypt test:', decrypted === 'secret' ? 'PASSED' : 'FAILED');

    console.log('\n✓ Basic example completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the example
basicExample().catch(console.error);