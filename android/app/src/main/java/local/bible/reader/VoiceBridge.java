package local.bible.reader;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;

public class VoiceBridge {
    private final Activity activity;
    private final WebView webView;
    private SpeechRecognizer recognizer;
    private MediaRecorder cloudRecorder;
    private File cloudAudioFile;
    private String cloudProvider = "";
    private String cloudKey = "";
    private String cloudModel = "";
    private String cloudBaseUrl = "";
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
    public String startCloud(String provider, String key, String model, String baseUrl) {
        activity.runOnUiThread(() -> {
            try {
                if (android.os.Build.VERSION.SDK_INT >= 23 && activity.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    activity.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 42);
                    emitError("请允许麦克风权限后再试一次");
                    return;
                }
                if (!"mimo".equals(provider)) {
                    emitError("当前云端语音暂只支持小米 MiMo");
                    return;
                }
                if (key == null || key.trim().isEmpty()) {
                    emitError("请先在 AI 配置里填写小米 MiMo Key");
                    return;
                }
                stopCloudRecorder(false);
                cloudProvider = provider;
                cloudKey = key.trim();
                cloudModel = model == null || model.trim().isEmpty() ? "mimo-v2.5-asr" : model.trim();
                cloudBaseUrl = baseUrl == null || baseUrl.trim().isEmpty() ? "https://api.xiaomimimo.com/v1" : baseUrl.trim();
                cloudAudioFile = new File(activity.getCacheDir(), "mimo-voice-" + System.currentTimeMillis() + ".m4a");
                cloudRecorder = new MediaRecorder();
                cloudRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
                cloudRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
                cloudRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
                cloudRecorder.setAudioSamplingRate(16000);
                cloudRecorder.setAudioEncodingBitRate(64000);
                cloudRecorder.setOutputFile(cloudAudioFile.getAbsolutePath());
                cloudRecorder.prepare();
                cloudRecorder.start();
                emit("start", "");
            } catch (Throwable error) {
                stopCloudRecorder(true);
                emitError(message(error));
            }
        });
        return "{\"ok\":true}";
    }

    @JavascriptInterface
    public String stopCloud() {
        activity.runOnUiThread(() -> {
            File file = cloudAudioFile;
            String provider = cloudProvider;
            String key = cloudKey;
            String model = cloudModel;
            String baseUrl = cloudBaseUrl;
            try {
                if (cloudRecorder == null) return;
                cloudRecorder.stop();
                stopCloudRecorder(false);
                emit("end", "");
                new Thread(() -> uploadCloudAudio(provider, key, model, baseUrl, file)).start();
            } catch (Throwable error) {
                stopCloudRecorder(true);
                emitError(message(error));
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

    private void stopCloudRecorder(boolean deleteFile) {
        if (cloudRecorder != null) {
            try {
                cloudRecorder.release();
            } catch (Throwable ignored) {
            }
            cloudRecorder = null;
        }
        if (deleteFile && cloudAudioFile != null) {
            try {
                cloudAudioFile.delete();
            } catch (Throwable ignored) {
            }
        }
    }

    private void uploadCloudAudio(String provider, String key, String model, String baseUrl, File file) {
        try {
            if (!"mimo".equals(provider)) throw new IllegalArgumentException("当前云端语音暂只支持小米 MiMo");
            if (file == null || !file.exists() || file.length() < 512) throw new IllegalArgumentException("录音太短，请按住语音按钮说完后再松开");
            emit("ready", "");
            String text = requestMimoAsr(key, model, baseUrl, file);
            emit("result", text);
        } catch (Throwable error) {
            emitError(message(error));
        } finally {
            if (file != null) {
                try {
                    file.delete();
                } catch (Throwable ignored) {
                }
            }
        }
    }

    private String requestMimoAsr(String key, String model, String baseUrl, File file) throws Exception {
        String audioBase64 = Base64.encodeToString(readAll(new java.io.FileInputStream(file)), Base64.NO_WRAP);
        JSONObject inputAudio = new JSONObject()
                .put("data", "data:audio/mp4;base64," + audioBase64);
        JSONObject audioContent = new JSONObject()
                .put("type", "input_audio")
                .put("input_audio", inputAudio);
        JSONObject message = new JSONObject()
                .put("role", "user")
                .put("content", new JSONArray().put(audioContent));
        JSONObject body = new JSONObject()
                .put("model", model == null || model.isEmpty() ? "mimo-v2.5-asr" : model)
                .put("messages", new JSONArray().put(message))
                .put("asr_options", new JSONObject().put("language", "auto"));
        String endpoint = normalizeChatUrl(baseUrl);
        HttpURLConnection connection = (HttpURLConnection) new URL(endpoint).openConnection();
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(60000);
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Authorization", "Bearer " + key);
        connection.setRequestProperty("api-key", key);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        byte[] payload = body.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream output = connection.getOutputStream()) {
            output.write(payload);
        }
        byte[] responseBytes;
        if (connection.getResponseCode() >= 200 && connection.getResponseCode() < 300) {
            responseBytes = readAll(connection.getInputStream());
        } else {
            responseBytes = readAll(connection.getErrorStream());
            String errorText = new String(responseBytes, StandardCharsets.UTF_8);
            if (connection.getResponseCode() == 401) {
                errorText = "MiMo Key 鉴权失败。请检查 Key 是否完整、是否填错空格，以及 Token Plan 是否需要在 MiMo Base URL 填专属地址。原始返回：" + errorText;
            }
            throw new RuntimeException(errorText);
        }
        JSONObject response = new JSONObject(new String(responseBytes, StandardCharsets.UTF_8));
        return response.getJSONArray("choices").getJSONObject(0).getJSONObject("message").optString("content", "");
    }

    private byte[] readAll(java.io.InputStream input) throws Exception {
        if (input == null) return new byte[0];
        byte[] buffer = new byte[8192];
        java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream();
        int read;
        while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
        return output.toByteArray();
    }

    private String normalizeChatUrl(String value) {
        String raw = value == null || value.trim().isEmpty() ? "https://api.xiaomimimo.com/v1" : value.trim();
        while (raw.endsWith("/")) raw = raw.substring(0, raw.length() - 1);
        if (raw.endsWith("/chat/completions")) return raw;
        return raw + "/chat/completions";
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
