package local.bible.reader;

import android.webkit.JavascriptInterface;

public class AndroidBridge {
    private final OfflineApi offlineApi;

    public AndroidBridge(OfflineApi offlineApi) {
        this.offlineApi = offlineApi;
    }

    @JavascriptInterface
    public String postJson(String path, String payload) {
        return offlineApi.handlePost(path, payload);
    }
}
