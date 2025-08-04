const { 
  createIdentity, 
  createEncryptedBlackBox,
  Utils,
  getVersion 
} = require('../lib');

async function encryptedExample() {
  console.log('Gfless Node.js Encrypted BlackBox Example');
  console.log('Version:', getVersion());
  console.log();

  try {
    // Create an identity with proxy settings (optional)
    const identity = createIdentity('encrypted_identity.json', {
      proxyIp: '127.0.0.1',
      proxyPort: '8080',
      proxyUsername: 'user',
      proxyPassword: 'pass',
      useProxy: false // Disabled for this example
    });
    console.log('✓ Identity created with proxy configuration');

    // Update the identity
    identity.update();
    console.log('✓ Identity updated');

    // Authentication parameters (these would come from your login process)
    const accountId = 'example_account_123';
    const gsid = 'gameforge_session_id_456789';
    const installationId = 'installation_id_abc123';

    console.log('\n--- Authentication Parameters ---');
    console.log('Account ID:', accountId);
    console.log('GSID:', gsid);
    console.log('Installation ID:', installationId);

    // Create an encrypted blackbox for authentication
    const encryptedBox = createEncryptedBlackBox(
      identity, 
      accountId, 
      gsid, 
      installationId
    );

    const encrypted = encryptedBox.encrypted();
    console.log('\n✓ Encrypted BlackBox generated');
    console.log('Encrypted data:', encrypted.substring(0, 100) + '...');
    console.log('Length:', encrypted.length, 'characters');

    // Show fingerprint information
    const fingerprint = identity.getFingerprint();
    console.log('\n--- Fingerprint Information ---');
    
    if (fingerprint.creation) {
      console.log('Creation time:', fingerprint.creation);
    }
    if (fingerprint.v) {
      console.log('Version:', fingerprint.v);
    }
    if (fingerprint.d) {
      console.log('Timing delay:', fingerprint.d, 'ms');
    }
    
    if (fingerprint.request) {
      console.log('\n--- Request Data ---');
      console.log('Installation:', fingerprint.request.installation || 'N/A');
      console.log('Session:', fingerprint.request.session || 'N/A');
      
      if (fingerprint.request.features && Array.isArray(fingerprint.request.features)) {
        console.log('Features:', fingerprint.request.features.length, 'items');
      }
    }

    // Demonstrate multiple encrypted boxes with same identity
    console.log('\n--- Multiple Encrypted Boxes ---');
    
    const box1 = createEncryptedBlackBox(identity, 'account1', 'session1', 'install1');
    const box2 = createEncryptedBlackBox(identity, 'account2', 'session2', 'install2');
    
    const encrypted1 = box1.encrypted();
    const encrypted2 = box2.encrypted();
    
    console.log('Box 1 (50 chars):', encrypted1.substring(0, 50) + '...');
    console.log('Box 2 (50 chars):', encrypted2.substring(0, 50) + '...');
    console.log('Different?', encrypted1 !== encrypted2 ? 'YES' : 'NO');

    // Show timing information
    console.log('\n--- Timing Information ---');
    const startTime = Utils.getCurrentTimeMs();
    
    // Simulate some processing
    for (let i = 0; i < 1000; i++) {
      Utils.randomString(10);
    }
    
    const endTime = Utils.getCurrentTimeMs();
    console.log('Processing time:', endTime - startTime, 'ms');

    console.log('\n✓ Encrypted example completed successfully!');
    console.log('\nNote: This encrypted BlackBox can be used for Gameforge authentication');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the example
encryptedExample().catch(console.error);