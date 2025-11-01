import React, { useRef, useState, useEffect } from 'react';
import { StatusBar, View, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // FINAL KILL SCRIPT
  const FINAL_KILL_SCRIPT = `
    (function() {
      'use strict';

      // 1. INJECT GLOBAL CSS (works across shadow DOM)
      function injectCSS() {
        if (document.getElementById('kill-shorts-global')) return;
        const style = document.createElement('style');
        style.id = 'kill-shorts-global';
        style.textContent = \`
          /* GLOBAL HIDE SHORTS */
          a[href="/shorts"],
          a[href^="/shorts"],
          a[title="Shorts"],
          [href*="/shorts"],
          [title="Shorts"],
          yt-tab-shape,
          ytd-mini-guide-entry-renderer,
          ytd-guide-entry-renderer,
          tp-yt-paper-tab,
          [role="tab"] {
            contain: layout style !important;
          }

          a[href*="/shorts"],
          [href*="/shorts"],
          [title*="Shorts" i] {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transform: scale(0) !important;
          }

          /* Fix spacing */
          ytd-app[role="main"] > div > div {
            justify-content: space-around !important;
          }
        \`;
        document.head.appendChild(style);
      }

      // 2. Traverse ALL shadow DOMs
      function killShortsInShadow(root = document.body) {
        // Direct matches
        root.querySelectorAll('a[href*="/shorts"], [title*="Shorts" i]').forEach(el => {
          const parent = el.closest('yt-tab-shape, ytd-mini-guide-entry-renderer, [role="tab"]');
          if (parent) parent.style.display = 'none';
          el.style.display = 'none';
        });

        // Search inside shadow roots
        root.querySelectorAll('*').forEach(el => {
          if (el.shadowRoot) {
            killShortsInShadow(el.shadowRoot);
          }
        });
      }

      // 3. Run aggressively
      let count = 0;
      const killer = setInterval(() => {
        injectCSS();
        killShortsInShadow();
        count++;
        if (count > 300) clearInterval(killer); // 30 seconds max
      }, 100);

      // 4. On load
      window.addEventListener('load', () => {
        setTimeout(() => {
          injectCSS();
          killShortsInShadow();
        }, 500);
      });

      // 5. Redirect /shorts/
      document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a?.href?.includes('/shorts/')) {
          e.preventDefault();
          const id = a.href.split('/shorts/')[1].split('?')[0];
          if (id) {
            window.location.href = '/watch?v=' + id;
          }
        }
      }, true);

      // 6. If already on Shorts
      if (location.pathname.startsWith('/shorts/')) {
        const id = location.pathname.split('/shorts/')[1].split('?')[0];
        if (id) {
          window.location.replace('/watch?v=' + id);
        }
      }

      // 7. Debug
      setTimeout(() => {
        window.ReactNativeWebView?.postMessage('SHORTS_DEAD');
      }, 3000);

    })();
    true;
  `;

  const onMessage = (e: any) => {
    if (e.nativeEvent.data === 'SHORTS_DEAD') {
      console.log('SHORTS BUTTON MAR GAYA');
    }
  };

  // Force reload
  useEffect(() => {
    const t = setTimeout(() => webViewRef.current?.reload(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <StatusBar barStyle="light-content" />

        {canGoBack && (
          <View style={{ position: 'absolute', top: 50, left: 10, zIndex: 10 }}>
            <Button title="Back" color="#ff4444" onPress={() => webViewRef.current?.goBack()} />
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
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          onNavigationStateChange={nav => setCanGoBack(nav.canGoBack)}

          // BOTH INJECTIONS
          injectedJavaScriptBeforeContentLoaded={FINAL_KILL_SCRIPT}
          injectedJavaScript={FINAL_KILL_SCRIPT}

          onMessage={onMessage}
          onError={(e) => console.warn('WebView Error:', e.nativeEvent)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}