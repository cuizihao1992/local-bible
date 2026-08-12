package local.bible.reader;

import android.net.Uri;
import android.webkit.JavascriptInterface;

public class AndroidBridge {
    private final OfflineApi offlineApi;

    public AndroidBridge(OfflineApi offlineApi) {
        this.offlineApi = offlineApi;
    }

    @JavascriptInterface
    public String getJson(String path) {
        String url = path.startsWith("/") ? "https://offline.local" + path : "https://offline.local/" + path;
        return offlineApi.handle("GET", Uri.parse(url));
    }

    @JavascriptInterface
    public String postJson(String path, String payload) {
        return offlineApi.handlePost(path, payload);
    }
}
