"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { InvoiceLineItem } from "@/lib/api";

interface InvoiceCheckerProps {
  lineItems: InvoiceLineItem[];
}

type ScannedEntry = {
  code: string;
  description: string;
  matched: boolean;
  message: string;
  time: string;
};

function normalizeValue(value: string) {
  return value.trim().toUpperCase();
}

export function InvoiceChecker({ lineItems }: InvoiceCheckerProps) {
  const expectedByCode = useMemo(() => {
    const map = new Map<
      string,
      {
        description: string;
        expectedQty: number;
        scannedQty: number;
        unit: string;
      }
    >();

    for (const item of lineItems) {
      const code = normalizeValue(item.Item.Code || item.ItemDescription || item.Item.Name);
      const description = item.ItemDescription || item.Item.Name || "Unknown item";
      const unit = item.UnitOfMeasure?.Code || "PC";
      const expectedQty = item.Qty || 0;

      const existing = map.get(code);
      if (existing) {
        existing.expectedQty += expectedQty;
      } else {
        map.set(code, {
          description,
          expectedQty,
          scannedQty: 0,
          unit,
        });
      }
    }

    return map;
  }, [lineItems]);

  const [scanValue, setScanValue] = useState("");
  const [scanLog, setScanLog] = useState<ScannedEntry[]>([]);
  const [scannedCounts, setScannedCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const lastScannedRef = useRef<string>("");

  const totalExpected = lineItems.reduce((sum, item) => sum + (item.Qty || 0), 0);
  const totalScanned = Object.values(scannedCounts).reduce((sum, qty) => sum + qty, 0);

  const matchedCount = Array.from(expectedByCode.entries()).reduce(
    (sum, [code, entry]) => sum + Math.min(entry.expectedQty, scannedCounts[code] || 0),
    0
  );

  const isComplete = totalExpected > 0 && matchedCount >= totalExpected;

  const handleScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitScan(scanValue);
  };

  const handleCameraResult = (value: string) => {
    const normalizedValue = normalizeValue(value);
    if (!normalizedValue) {
      return;
    }

    if (normalizedValue === lastScannedRef.current) {
      return;
    }

    lastScannedRef.current = normalizedValue;
    submitScan(normalizedValue);
    setTimeout(() => {
      lastScannedRef.current = "";
    }, 1200);
  };

  const startCameraScan = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera scanning is not supported by this browser.");
      return;
    }

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferredDevice = devices.find((device) => /back|rear|environment/i.test(device.label));
      const deviceId = preferredDevice?.deviceId || devices[0]?.deviceId;

      if (!deviceId) {
        setCameraError("No camera device found.");
        return;
      }

      const codeReader = new BrowserMultiFormatReader();
      const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result: any, error: any) => {
        if (result) {
          handleCameraResult(result.getText());
        }

        if (error && !(error.name === "NotFoundException" || error.name === "ChecksumException" || error.name === "FormatException")) {
          setCameraError(error.message || "Camera scan error.");
        }
      });

      scannerControlsRef.current = controls;
      setCameraActive(true);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Unable to start camera scanning.");
      setCameraActive(false);
    }
  };

  const stopCameraScan = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setCameraActive(false);
  };

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
      setTimeout(() => {
        try {
          ctx.close && ctx.close();
        } catch (e) {}
      }, 200);
    } catch (e) {
      // ignore audio errors
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    try {
      if (navigator.vibrate) navigator.vibrate(120);
    } catch (e) {}
    if (type === "success") playBeep();
    setTimeout(() => setNotification(null), 1200);
  };

  useEffect(() => {
    return () => {
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
    };
  }, []);

  const submitScan = (value: string) => {
    const code = normalizeValue(value);
    if (!code) {
      setError("Please scan or type a valid item code.");
      showNotification("Invalid code", "error");
      return;
    }

    setError(null);
    setScanValue("");

    const expected = expectedByCode.get(code);
    const currentScannedQty = scannedCounts[code] || 0;

    if (!expected) {
      const newEntry: ScannedEntry = {
        code,
        description: "Not on invoice",
        matched: false,
        message: "Item is not part of this invoice.",
        time: new Date().toLocaleTimeString(),
      };
      setScanLog((prev) => [newEntry, ...prev].slice(0, 20));
      showNotification("Item not on invoice", "error");
      return;
    }

    if (currentScannedQty >= expected.expectedQty) {
      const newEntry: ScannedEntry = {
        code,
        description: expected.description,
        matched: false,
        message: `All expected units for this code have already been scanned (expected ${expected.expectedQty}).`,
        time: new Date().toLocaleTimeString(),
      };
      setScanLog((prev) => [newEntry, ...prev].slice(0, 20));
      showNotification("All units already scanned", "error");
      return;
    }

    const newQty = currentScannedQty + 1;
    setScannedCounts((prev) => ({ ...prev, [code]: newQty }));

    const newEntry: ScannedEntry = {
      code,
      description: expected.description,
      matched: true,
      message: `Scanned successfully. ${newQty} / ${expected.expectedQty} recorded for this item code.`,
      time: new Date().toLocaleTimeString(),
    };
    setScanLog((prev) => [newEntry, ...prev].slice(0, 20));
    showNotification(`Scanned: ${code}`, "success");
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Invoice Checker</h3>
        <p className="mt-2 text-sm text-slate-600">
          Scan each item barcode or enter the product code, then press Enter. The checker will
          show if scanned items match the invoice and highlight duplicates or extra items.
        </p>
      </div>

      {notification ? (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition-colors ${
            notification.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      <form onSubmit={handleScan} className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
        <label className="block w-full">
          <span className="text-sm font-medium text-slate-700">Scan item code</span>
          <input
            type="text"
            value={scanValue}
            autoFocus
            onChange={(event) => setScanValue(event.target.value)}
            placeholder="Scan barcode or enter item code"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          Add scan
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Camera barcode scan</h4>
              <p className="mt-1 text-sm text-slate-600">
                Use your device camera to scan item barcodes for invoice verification.
              </p>
            </div>
            <button
              type="button"
              onClick={cameraActive ? stopCameraScan : startCameraScan}
              className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition ${
                cameraActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {cameraActive ? "Stop camera" : "Start camera"}
            </button>
          </div>

          {cameraError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {cameraError}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-950/5 p-2">
            <video
              ref={videoRef}
              className="h-64 w-full rounded-xl bg-black object-cover"
              autoPlay
              muted
              playsInline
            />
            {!cameraActive && (
              <div className="mt-3 text-sm text-slate-500">
                Camera preview is inactive. Click the button to start scanning.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Items expected</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{totalExpected}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Items scanned</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{totalScanned}</div>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm ${isComplete ? "bg-emerald-50 border border-emerald-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <div className="text-sm text-slate-500">Invoice completion</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {matchedCount} / {totalExpected}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {isComplete ? "All required items have been scanned." : "Continue scanning to verify items."}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Code</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-right font-semibold">Expected</th>
              <th className="px-4 py-3 text-right font-semibold">Scanned</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Array.from(expectedByCode.entries()).map(([code, item]) => {
              const scannedQty = scannedCounts[code] || 0;
              const status = scannedQty === item.expectedQty ? "OK" : scannedQty > item.expectedQty ? "Extra" : "Missing";
              return (
                <tr key={code} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-900">{code}</td>
                  <td className="px-4 py-3 text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 text-right text-slate-900">{item.expectedQty.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-900">{scannedQty.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        status === "OK"
                          ? "bg-emerald-100 text-emerald-700"
                          : status === "Extra"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-md font-semibold text-slate-900">Recent scan log</h4>
          <span className="text-sm text-slate-500">Last {scanLog.length} entries</span>
        </div>
        {scanLog.length === 0 ? (
          <p className="text-sm text-slate-600">No items scanned yet.</p>
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            {scanLog.map((entry, index) => (
              <div key={`${entry.code}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-900">{entry.code}</span>
                  <span className="text-xs text-slate-500">{entry.time}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-slate-600">
                  <span>{entry.description}</span>
                  <span className={entry.matched ? "text-emerald-700" : "text-red-700"}>
                    {entry.matched ? "Matched" : "Mismatch"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
