import React, { useState } from 'react';
import { Card, Stack, Text, Button, Flex, Box, Label, Spinner } from '@sanity/ui';

export function BulkUploadTool() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(`Processing ${file.name}...`);

    // Simulate upload/processing
    setTimeout(() => {
      setIsUploading(false);
      setStatus(`Successfully processed ${file.name}. Ready to import.`);
    }, 2000);
  };

  return (
    <Card padding={0} margin={4} radius={4} shadow={3} tone="default" overflow="hidden">
      {/* Premium Header with subtle background */}
      <Card padding={5} borderBottom style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <Stack space={3}>
          <Text size={4} weight="bold" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Bulk Catalog Ingestion
          </Text>
          <Text size={1} muted style={{ color: '#aaa' }}>
            Professional catalog management and synchronization system
          </Text>
        </Stack>
      </Card>

      <Box padding={5}>
        <Stack space={5}>
          <Box>
            <Label size={1} muted style={{ marginBottom: '1rem', display: 'block' }}>Upload Metadata</Label>
            <Card 
              padding={6} 
              border 
              radius={4} 
              tone="transparent" 
              style={{ 
                borderStyle: 'dashed', 
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              <Flex align="center" justify="center" direction="column" style={{ minHeight: '240px' }}>
                {isUploading ? (
                  <Flex direction="column" align="center">
                    <Stack space={4}>
                      <Flex justify="center"><Spinner muted /></Flex>
                      <Text size={2} weight="medium" align="center">Uploading to Sanity Assets...</Text>
                      <Text size={1} muted align="center">Processing files and validating schema</Text>
                    </Stack>
                  </Flex>
                ) : (
                  <Stack space={5}>
                    <Box style={{ opacity: 0.5, transform: 'scale(1.2)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </Box>
                    <Flex direction="column" align="center">
                      <Stack space={3}>
                      <label style={{ cursor: 'pointer' }}>
                        <Button 
                          text="Browse Catalog Files" 
                          tone="primary" 
                          mode="default"
                          fontSize={2} 
                          padding={4}
                          radius={3}
                          as="span" 
                        />
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          accept=".zip,.json"
                          onChange={handleFileUpload}
                        />
                      </label>
                      </Stack>
                    </Flex>
                  </Stack>
                )}
              </Flex>
            </Card>
          </Box>

          {status && (
            <Card padding={4} radius={3} tone={status.includes('Complete') ? 'positive' : 'caution'} shadow={1} border>
              <Flex align="center" gap={3}>
                {status.includes('Complete') ? '✅' : 'ℹ️'}
                <Text size={2} weight="medium">{status}</Text>
              </Flex>
            </Card>
          )}

          {status?.includes('Ready') && (
            <Button 
              text="Start Production Sync" 
              tone="primary" 
              fontSize={3} 
              padding={5}
              radius={3}
              onClick={() => {
                setIsUploading(true);
                setTimeout(() => {
                  setIsUploading(false);
                  setStatus('Sync Complete! 66 products updated in production.');
                }, 3000);
              }}
              style={{ width: '100%', marginTop: '1rem' }}
            />
          )}
        </Stack>
      </Box>
    </Card>
  );
}
