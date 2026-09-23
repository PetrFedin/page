// Сборка PNG-кадров в H.264 MP4 средствами AVFoundation.
//
// Зачем свой инструмент: ffmpeg, который лежит рядом с Playwright, умеет
// только VP8 и PNG — H.264 он не кодирует, а avconvert из macOS не читает
// WebM. Между ними и встаёт этот шаг: кадры уже распакованы, остаётся
// сложить их в MP4 системным кодировщиком.
//
// Запуск: frames-to-mp4 <папка с кадрами> <выходной .mp4> <кадров в секунду>

import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 4, let fps = Int32(args[3]) else {
  FileHandle.standardError.write("нужно: frames-to-mp4 <кадры> <выход.mp4> <fps>\n".data(using: .utf8)!)
  exit(2)
}
let dir = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: out)

let frames = try FileManager.default
  .contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension == "png" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }
guard let first = frames.first,
      let src = CGImageSourceCreateWithURL(first as CFURL, nil),
      let probe = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
  FileHandle.standardError.write("не нашёл кадров в \(dir.path)\n".data(using: .utf8)!)
  exit(1)
}
// Ширина и высота кодировщика должны быть чётными.
let w = probe.width - probe.width % 2
let h = probe.height - probe.height % 2

let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: w,
  AVVideoHeightKey: h,
  AVVideoCompressionPropertiesKey: [
    // Запись экрана жмётся хорошо: большой битрейт тут только утяжеляет файл.
    AVVideoAverageBitRateKey: w * h * 3 / 4,
    // Между кадрами меняется в основном курсор — частые опорные кадры не нужны.
    AVVideoMaxKeyFrameIntervalKey: 125,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
  ],
])
input.expectsMediaDataInRealTime = false
let pool = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: w,
  kCVPixelBufferHeightKey as String: h,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let space = CGColorSpaceCreateDeviceRGB()
for (i, url) in frames.enumerated() {
  guard let s = CGImageSourceCreateWithURL(url as CFURL, nil),
        let img = CGImageSourceCreateImageAtIndex(s, 0, nil) else { continue }
  var buf: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, pool.pixelBufferPool!, &buf)
  guard let pixels = buf else { continue }
  CVPixelBufferLockBaseAddress(pixels, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pixels), width: w, height: h,
                      bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixels),
                      space: space,
                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
                        | CGBitmapInfo.byteOrder32Little.rawValue)
  ctx?.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  CVPixelBufferUnlockBaseAddress(pixels, [])
  while !input.isReadyForMoreMediaData { usleep(2000) }
  pool.append(pixels, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed {
  FileHandle.standardError.write("не записалось: \(writer.error?.localizedDescription ?? "?")\n".data(using: .utf8)!)
  exit(1)
}
print("\(out.lastPathComponent): \(frames.count) кадров, \(w)x\(h)")
