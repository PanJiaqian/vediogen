# 后端字幕精准烧录复刻文档（SpringBoot + FFmpeg）

本文档目标：把前端预览区的字幕展示效果（自动换行、居中、底边距、描边、字体大小随画面缩放）在后端“导出视频并烧录字幕”时做到一致。

对应的前端实现位置：
- 字幕 DOM 结构与显示条件：[VideoEditView.vue](file:///d:/百度云工作内容文档/影视创作平台/front_aivideos/vediogen/src/views/VideoEditView.vue#L824-L841)
- 字幕最大宽度与缩放计算：[VideoEditView.vue](file:///d:/百度云工作内容文档/影视创作平台/front_aivideos/vediogen/src/views/VideoEditView.vue#L2274-L2303)
- 字幕样式（含自动换行）：[VideoEditView.vue](file:///d:/百度云工作内容文档/影视创作平台/front_aivideos/vediogen/src/views/VideoEditView.vue#L8611-L8629)

---

## 1. 前端效果的“可复刻定义”

前端字幕效果本质上由两部分共同决定：

1) **换行策略（核心）**
- CSS 使用 `white-space: pre-wrap`：保留用户输入的换行与空格，并在行宽不足时自动换行。
- 在视觉上等价于：
  - 文本里出现换行符时强制换行
  - 其余情况按容器最大宽度自动折行

2) **可用行宽（关键约束）**
- JS 动态计算 `subtitleMaxWidthPx = 预览媒体渲染宽度 - 48px`。
- 换句话说：字幕允许占用的最大宽度是画面宽度减去左右安全边距（各 24px）。

3) **排版基准（位置与描边）**
- 位置：底部居中（`left:50% + translateX(-50%)`），距离底边 `24px`。
- 描边：黑色描边（前端 `-webkit-text-stroke: 0.6px #000`），无阴影。
- 字重：700。

4) **字体缩放（使“不同预览尺寸”看起来一致）**
- 前端通过 `subtitleFontScale = min(渲染宽/原宽, 渲染高/原高)` 把字号按比例缩放。
- 后端导出时如果输出分辨率与原视频分辨率一致，缩放系数可视为 1。
- 若导出分辨率不同，需按同样公式计算并应用到字号。

---

## 2. 后端复刻的推荐路线：ASS 字幕 + libass 渲染 + FFmpeg 烧录

要在后端做到“自动换行 + 描边 + 精准控制边距/对齐”，推荐使用 **ASS（Advanced SubStation Alpha，高级字幕格式）**。

原因：
- FFmpeg 的 `subtitles` 滤镜内部使用 libass，能按样式规则自动折行，并支持描边、对齐、边距等。
- 相比直接 `drawtext`，ASS 对“多行自动换行”更稳定，样式表达更完整。

---

## 3. 样式映射表：前端 CSS → ASS/FFmpeg

| 前端表现 | 前端实现 | 后端复刻（ASS/FFmpeg） |
|---|---|---|
| 最大宽度 = 画面宽 - 48px | `subtitleMaxWidthPx = basis - 48` | `MarginL = 24, MarginR = 24`（让可用文本区域自动变为 W-48） |
| 自动换行 + 保留换行 | `white-space: pre-wrap` | ASS `WrapStyle: 2`；文本中的换行用 `\N`（ASS 强制换行） |
| 底部居中 | `left:50% + translateX(-50%)` + `text-align:center` | `Alignment=2`（底部居中） |
| 距离底部 24px | `bottom: 24px` | `MarginV = 24` |
| 描边 0.6px 黑色 | `-webkit-text-stroke: 0.6px #000` | `Outline=1`（ASS 的描边通常取整数；0.6 最接近 1）+ `OutlineColour` 黑色 |
| 无阴影 | `text-shadow: none` | `Shadow=0` |
| 字重 700 | `font-weight: 700` | ASS `Bold=-1`（开启粗体） |
| 字号随缩放变化 | `fontSizePx = basePx * scale` | `FontSize = basePx * scale`（按输出/源分辨率计算） |

说明：
- ASS 的描边宽度是“视觉单位”，通常为整数更稳定；要无限贴近 0.6px 可尝试 0.7 或 0.8，但不同字体与渲染器会略有差异。

---

## 4. 关键参数计算（完全对齐前端公式）

### 4.1 输出与源的尺寸

设：
- `iw, ih`：源视频宽高（或你准备烧录时的“画面基准”宽高）
- `ow, oh`：最终导出视频宽高（如果导出时会缩放）

### 4.2 缩放系数（与前端一致）

前端逻辑是：

`scale = min(displayWidth / intrinsicWidth, displayHeight / intrinsicHeight)`

后端等价实现：
- 如果你先把视频缩放到 `ow x oh`，然后在同一个滤镜链里烧录字幕，那么在字幕阶段可认为显示尺寸就是 `ow x oh`。
- 为了与前端统一，建议：

`scale = min(ow / iw, oh / ih)`

当 `ow==iw` 且 `oh==ih` 时，`scale=1`。

### 4.3 字号

前端默认字号 `60px`，后端建议也使用同一基准：

`fontSize = 60 * scale`

为避免小数导致渲染差异，建议保留 2 位小数或直接四舍五入到 0.5：

`fontSize = round(fontSize * 2) / 2`

### 4.4 最大宽度（左右边距）

前端：`maxWidthPx = videoWidth - 48`。

后端：
- `marginL = 24`
- `marginR = 24`

这会让 libass 自动折行的有效行宽变为 `ow - 48`（等价于前端）。

---

## 5. ASS 模板（可直接生成）

下面是一个可复用的 ASS 内容模板，你只要把分辨率、字体、字号、时间轴、文本替换进去就行。

> 注意：ASS 强制换行是 `\N`（两个字符：反斜杠 + N）。

```ass
[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Default,Microsoft YaHei,60,&H00FFFFFF,&H00000000,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,1,0,2,24,24,24,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,这是第一条字幕，会根据边距自动换行
Dialogue: 0,0:00:05.00,0:00:10.00,Default,,0,0,0,,这条字幕包含手动换行\N所以会强制分两行
```

### 5.1 文本“pre-wrap”等价处理（非常关键）

为了复刻前端 `pre-wrap`，建议在后端把用户输入的普通换行符转换为 ASS 换行：
- `\r\n` 或 `\n` → `\N`

另外，`pre-wrap` 会保留用户输入的连续空格。ASS 对连续空格在不同场景可能会被“视觉上压缩”，建议：
- 把连续空格转换为 `\h`（ASS 的“硬空格”）

示例策略：
- 把文本里的每个普通空格替换为 `\h`，或至少替换连续空格中的第二个及以后为空 `\h`。

---

## 6. FFmpeg 烧录命令（Windows 可直接运行）

### 6.1 最小可用命令

```powershell
ffmpeg -y -i "D:\\video\\input.mp4" -vf "subtitles='D\\\\:/video/subtitle.ass'" -c:a copy "D:\\video\\output.mp4"
```

说明：
- 在 Windows 的 FFmpeg 滤镜参数中，为避免反斜杠转义混乱，建议把盘符路径写成 `D\\:/path/file.ass` 这种形式。

### 6.2 强制样式（推荐，确保与前端一致）

即使 ASS 里写了样式，你也可以用 `force_style` 兜底覆盖（生产更稳）。

```powershell
ffmpeg -y -i "D:\\video\\input.mp4" `
  -vf "subtitles='D\\\\:/video/subtitle.ass':force_style='FontName=Microsoft YaHei,FontSize=60,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,Alignment=2,MarginL=24,MarginR=24,MarginV=24'" `
  -c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 192k "D:\\video\\output.mp4"
```

说明：
- `BorderStyle=1`：使用描边样式
- `Outline=1`：描边宽度
- `Alignment=2`：底部居中
- `MarginL/MarginR/MarginV`：左右/底部边距，直接对应前端的 24/24/24

### 6.3 指定字体目录（推荐）

线上服务器不一定有你需要的字体，建议将字体文件（如 `msyh.ttc`）随服务一起发布，并通过 `fontsdir` 指定。

```powershell
ffmpeg -y -i "D:\\video\\input.mp4" -vf "subtitles='D\\\\:/video/subtitle.ass':fontsdir='D\\\\:/video/fonts'" -c:a copy "D:\\video\\output.mp4"
```

---

## 7. SpringBoot 调用 FFmpeg（ProcessBuilder 方式）

下面给出一个可直接搬到 SpringBoot 的实现骨架：

1) 用 `ffprobe` 获取视频宽高
2) 计算 `scale` 与 `fontSize`
3) 生成 ASS 文件（PlayRes 与 Style 里写入 margin、字号、描边等）
4) 执行 FFmpeg 烧录

> 重点：在 Java 里尽量用 `ProcessBuilder(List<String>)` 分离参数，避免整条命令手动拼引号导致转义灾难。

```java
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

public final class SubtitleBurnInService {

  /**
   * 生成 ASS 文本内容。
   *
   * @param playResX 输出画面宽度（像素）
   * @param playResY 输出画面高度（像素）
   * @param fontName 字体名称（需在系统或 fontsdir 中可用）
   * @param fontSize 字号（建议按 scale 计算后的值）
   * @param marginL 左边距（像素），建议 24
   * @param marginR 右边距（像素），建议 24
   * @param marginV 底边距（像素），建议 24
   * @param outline 描边宽度，建议 1
   * @param events ASS 的 Dialogue 行列表（已完成时间轴与文本转义）
   * @return 完整 ASS 文件内容
   *
   * @throws IllegalArgumentException 参数非法时抛出
   *
   * @example
   * String ass = buildAss(1920,1080,"Microsoft YaHei",60,24,24,24,1,List.of(
   *   "Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,你好\\N世界"
   * ));
   */
  public static String buildAss(
      int playResX,
      int playResY,
      String fontName,
      double fontSize,
      int marginL,
      int marginR,
      int marginV,
      double outline,
      List<String> events
  ) {
    if (playResX <= 0 || playResY <= 0) throw new IllegalArgumentException("PlayRes 非法");
    if (fontName == null || fontName.isBlank()) throw new IllegalArgumentException("fontName 为空");
    if (!(fontSize > 0)) throw new IllegalArgumentException("fontSize 非法");
    if (events == null) throw new IllegalArgumentException("events 为空");

    StringBuilder sb = new StringBuilder(4096);
    sb.append("[Script Info]\n")
      .append("ScriptType: v4.00+\n")
      .append("PlayResX: ").append(playResX).append("\n")
      .append("PlayResY: ").append(playResY).append("\n")
      .append("WrapStyle: 2\n")
      .append("ScaledBorderAndShadow: yes\n\n");

    sb.append("[V4+ Styles]\n")
      .append("Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n");

    sb.append("Style: Default,")
      .append(fontName).append(",")
      .append(trimDouble(fontSize)).append(",")
      .append("&H00FFFFFF,")
      .append("&H00000000,")
      .append("&H00000000,")
      .append("&H00000000,")
      .append("-1,0,0,0,100,100,0,0,1,")
      .append(trimDouble(outline)).append(",")
      .append("0,2,")
      .append(marginL).append(",")
      .append(marginR).append(",")
      .append(marginV).append(",1\n\n");

    sb.append("[Events]\n")
      .append("Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n");
    for (String e : events) {
      if (e == null || e.isBlank()) continue;
      sb.append(e).append("\n");
    }
    return sb.toString();
  }

  /**
   * 把普通文本转成 ASS 文本（尽量复刻前端 pre-wrap）。
   *
   * @param raw 原始文本（可能包含 \n、连续空格等）
   * @return 可写入 Dialogue Text 字段的 ASS 文本
   *
   * @example
   * escapeAssText("A  B\nC") -> "A\\h\\hB\\NC"
   */
  public static String escapeAssText(String raw) {
    if (raw == null) return "";
    String t = raw.replace("\r\n", "\n");
    t = t.replace("\\", "\\\\");
    t = t.replace("\n", "\\N");
    t = t.replace(" ", "\\h");
    return t;
  }

  /**
   * 执行 FFmpeg 字幕烧录。
   *
   * @param ffmpegPath ffmpeg 可执行文件路径（Windows 示例：D:\\ffmpeg\\bin\\ffmpeg.exe）
   * @param inputVideo 输入视频路径
   * @param assFile ASS 文件路径
   * @param outputVideo 输出视频路径
   * @return FFmpeg 进程退出码（0 表示成功）
   *
   * @throws IOException 进程启动或 IO 失败
   * @throws InterruptedException 等待进程时被中断
   *
   * @example
   * int code = burnIn("D:\\ffmpeg\\bin\\ffmpeg.exe", Paths.get("D:\\in.mp4"), Paths.get("D:\\sub.ass"), Paths.get("D:\\out.mp4"));
   */
  public static int burnIn(String ffmpegPath, Path inputVideo, Path assFile, Path outputVideo)
      throws IOException, InterruptedException {
    List<String> cmd = new ArrayList<>();
    cmd.add(ffmpegPath);
    cmd.add("-y");
    cmd.add("-i");
    cmd.add(inputVideo.toAbsolutePath().toString());
    cmd.add("-vf");
    cmd.add("subtitles=" + assFile.toAbsolutePath());
    cmd.add("-c:v");
    cmd.add("libx264");
    cmd.add("-crf");
    cmd.add("18");
    cmd.add("-preset");
    cmd.add("veryfast");
    cmd.add("-c:a");
    cmd.add("copy");
    cmd.add(outputVideo.toAbsolutePath().toString());

    ProcessBuilder pb = new ProcessBuilder(cmd);
    pb.redirectErrorStream(true);
    Process p = pb.start();
    try (BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
      while (br.readLine() != null) {
        // 此处按你的项目规范写日志即可
      }
    }
    return p.waitFor();
  }

  private static String trimDouble(double v) {
    if (Double.isNaN(v) || Double.isInfinite(v)) return "0";
    String s = String.format(java.util.Locale.ROOT, "%.2f", v);
    return s.replaceAll("0+$", "").replaceAll("\\.$", "");
  }
}
```

---

## 8. 你要的“完全相同效果”里，最容易踩坑的 6 个点

1) **字体不一致**：前端浏览器用的是客户端字体；后端服务器未必装同样字体。必须显式指定字体或随包发布字体。

2) **路径转义**：Windows 上 `subtitles` 滤镜的文件路径建议用 `D\\:/...` 形式，或在 Java 里用参数分离避免引号地狱。

3) **描边差异**：前端 0.6px 在 ASS 里无法“精确像素等值”，推荐 `Outline=1` 作为最接近且稳定的选择。

4) **空格保留**：前端 `pre-wrap` 会保留多空格；ASS 建议用 `\h` 替换空格，才能稳定复刻。

5) **英文长单词断行**：前端可能通过 `word-break: break-word` 在无空格时强断。libass 默认更偏向“按空格断行”。如果你必须 100% 复刻这种强断行，建议在后端做“按字形测宽”的手动换行（成本较高，属于进阶方案）。

6) **缩放链路**：如果导出时视频做了缩放，务必让字幕的 PlayRes 与最终输出一致，并按 `min(ow/iw, oh/ih)` 对字号做缩放。

---

## 9. 最小复刻清单（你照着做就能一致）

- ASS：`WrapStyle: 2` + `Alignment=2` + `MarginL=24, MarginR=24, MarginV=24`
- 字号：`fontSize = 60 * min(ow/iw, oh/ih)`
- 描边：`Outline=1` + `Shadow=0`
- 文本预处理：`\n -> \N`，空格 ` -> \h`
- FFmpeg：`-vf subtitles=xxx.ass[:fontsdir=xxx][:force_style=...]`

