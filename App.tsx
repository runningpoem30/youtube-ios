import React, { useRef, useState } from 'react';
import { StatusBar, View, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // NUCLEAR ANTI-SHORTS SCRIPT
  const antiShortsScript = `
    (function() {
      'use strict';

      // Force hide + remove Shorts from bottom nav
      function nukeShortsButton() {
        // 1. Hide via CSS (instant)
        const style = document.createElement('style');
        style.id = 'nuke-shorts-css';
        style.textContent = \`
          /* Bottom nav Shorts button */
          a[href="/shorts"], 
          a[title="Shorts"],
          yt-tab-shape:has(a[href*="/shorts"]),
          ytd-mini-guide-entry-renderer:has(a[href*="/shorts"]),
          ytd-guide-entry-renderer:has(a[href*="/shorts"])
          { 
            display: none !important; 
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
          }

          /* Optional: Rebalance bottom nav (centers remaining tabs) */
          #tabs-container { justify-content: space-around !important; }
        \`;
        if (!document.getElementById('nuke-shorts-css')) {
          document.head.appendChild(style);
        }

        // 2. Remove from DOM (backup)
        document.querySelectorAll('yt-tab-shape').forEach(tab => {
          if (tab.innerHTML.includes('shorts') || tab.querySelector('a[href*="/shorts"]')) {
            tab.remove();
          }
        });

        // 3. Rebuild bottom nav if YouTube regenerates it
        const tabs = document.querySelector('#tabs-container');
        if (tabs && tabs.children.length === 4) {
          // If only 4 tabs left, re-center
          tabs.style.justifyContent = 'space-around';
        }
      }

      // Run every 300ms — YouTube can't stop this
      const interval = setInterval(nukeShortsButton, 300);

      // Also run on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nukeShortsButton);
      } else {
        nukeShortsButton();
      }

      // Run on navigation
      let lastUrl = location.href;
      const checkUrl = () => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          setTimeout(nukeShortsButton, 200);
        }
        requestAnimationFrame(checkUrl);
      };
      checkUrl();

      // Redirect /shorts/ links
      document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href && a.href.includes('/shorts/')) {
          e.preventDefault();
          const id = a.href.split('/shorts/')[1].split('?')[0];
          if (id) location.href = '/watch?v=' + id;
        }
      }, true);

      // If on Shorts page, redirect
      if (location.pathname.startsWith('/shorts/')) {
        const id = location.pathname.split('/shorts/')[1].split('?')[0];
        if (id) location.href = '/watch?v=' + id;
      }

      // Never let the interval die
      window.addEventListener('beforeunload', () => clearInterval(interval));
    })();
    true;
  `;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <StatusBar barStyle="light-content" />

        {/* Back Button */}
        {canGoBack && (
          <View style={{ position: 'absolute', top: 50, left: 10, zIndex: 10 }}>
            <Button
              title="Back"
              color="#ff4444"
              onPress={() => webViewRef.current?.goBack()}
            />
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: 'https://www.youtube.com' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          onNavigationStateChange={nav => setCanGoBack(nav.canGoBack)}

          // CRITICAL: BOTH INJECTIONS
          injectedJavaScriptBeforeContentLoaded={antiShortsScript}
          injectedJavaScript={antiShortsScript}

          // Prevent Android from ignoring script
          onMessage={() => {}}

          // Force reload on mount (optional)
          key="youtube-webview"
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}