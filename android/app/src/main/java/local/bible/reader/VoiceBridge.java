package local.bible.reader;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.util.ArrayList;
import java.util.Locale;

public class VoiceBridge {
    private final Activity activity;
    private final WebView webView;
    private SpeechRecognizer recognizer;
    private boolean listening = false;

    public VoiceBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    @JavascriptInterface
    public String isAvailable() {
        try {
            return "{\"available\":" + SpeechRecognizer.isRecognitionAvailable(activity) + "}";
        } catch (Throwable error) {
            return "{\"available\":false,\"error\":\"" + quoteValue(message(error)) + "\"}";
        }
    }

    @JavascriptInterface
    public String start() {
        activity.runOnUiThread(() -> {
            try {
                if (android.os.Build.VERSION.SDK_INT >= 23 && activity.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    activity.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 42);
                    emitError("请允许麦克风权限后再试一次");
                    return;
                }
                if (!SpeechRecognizer.isRecognitionAvailable(activity)) {
                    emitError("当前设备不支持语音识别");
                    return;
                }
                stopRecognizer();
                recognizer = SpeechRecognizer.createSpeechRecognizer(activity);
                recognizer.setRecognitionListener(listener());
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.CHINA.toString());
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                listening = true;
                recognizer.startListening(intent);
                emit("start", "");
            } catch (Throwable error) {
                emitError(message(error));
            }
        });
        return "{\"ok\":true}";
    }

    @JavascriptInterface
    public String stop() {
        activity.runOnUiThread(() -> {
            try {
                if (recognizer != null && listening) recognizer.stopListening();
            } catch (Throwable error) {
                emitError(message(error));
                stopRecognizer();
            }
        });
        return "{\"ok\":true}";
    }

    @JavascriptInterface
    public String cancel() {
        activity.runOnUiThread(this::stopRecognizer);
        return "{\"ok\":true}";
    }

    private RecognitionListener listener() {
        return new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { emit("ready", ""); }
            @Override public void onBeginningOfSpeech() { emit("speech", ""); }
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEndOfSpeech() { listening = false; emit("end", ""); }
            @Override public void onError(int error) { listening = false; emitError("语音识别失败：" + error); stopRecognizer(); }
            @Override public void onResults(Bundle results) { emitResult(results); stopRecognizer(); }
            @Override public void onPartialResults(Bundle partialResults) { emitPartial(partialResults); }
            @Override public void onEvent(int eventType, Bundle params) {}
        };
    }

    private void emitResult(Bundle bundle) {
        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        String text = matches == null || matches.isEmpty() ? "" : matches.get(0);
        emit("result", text);
    }

    private void emitPartial(Bundle bundle) {
        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        String text = matches == null || matches.isEmpty() ? "" : matches.get(0);
        if (!text.isEmpty()) emit("partial", text);
    }

    private void emitError(String message) {
        listening = false;
        emit("error", message);
    }

    private void emit(String type, String text) {
        String script = "window.handleAndroidVoice && window.handleAndroidVoice(" + quote(type) + "," + quote(text) + ")";
        webView.post(() -> webView.evaluateJavascript(script, null));
    }

    private void stopRecognizer() {
        listening = false;
        if (recognizer != null) {
            try {
                recognizer.cancel();
                recognizer.destroy();
            } catch (Throwable ignored) {
            }
            recognizer = null;
        }
    }

    private String message(Throwable error) {
        return error == null || error.getMessage() == null ? "语音识别异常" : error.getMessage();
    }

    private String quote(String value) {
        return "\"" + quoteValue(value) + "\"";
    }

    private String quoteValue(String value) {
        String safe = value == null ? "" : value;
        return safe.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
