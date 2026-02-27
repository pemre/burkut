import "@testing-library/jest-dom";

// gray-matter mock – jsdom ortamında Buffer polyfill gerekebilir
// Eğer "Buffer is not defined" hatası alırsanız:
// import { Buffer } from "buffer";
// globalThis.Buffer = Buffer;
