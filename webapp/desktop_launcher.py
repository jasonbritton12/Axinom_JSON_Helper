#!/usr/bin/env python3
"""Desktop launcher for the Axinom Ingest Helper.

No GUI toolkit required. This starts the local server, opens the browser,
and shuts down automatically after idle inactivity.
"""

from __future__ import annotations

import json
import os
import signal
import socket
import threading
import time
import webbrowser
from http.server import ThreadingHTTPServer
from urllib.error import URLError
from urllib.request import urlopen

from server import AppRequestHandler

HOST = "127.0.0.1"


def _read_int_env(name: str, default: int) -> int:
    raw = os.environ.get(name, str(default))
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default


PRIMARY_PORT = _read_int_env("AXINOM_HELPER_PORT", 8080)
FALLBACK_PORTS = (8090, 8100)
IDLE_TIMEOUT_SECONDS = _read_int_env("AXINOM_HELPER_IDLE_TIMEOUT", 90)
POLL_INTERVAL_SECONDS = 0.5


def _is_port_available(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def _is_existing_helper(host: str, port: int) -> bool:
    url = f"http://{host}:{port}/api/health"
    try:
        with urlopen(url, timeout=1.0) as response:  # noqa: S310
            if response.status != 200:
                return False
            payload = json.loads(response.read().decode("utf-8"))
            return bool(payload.get("ok"))
    except (URLError, OSError, ValueError, json.JSONDecodeError):
        return False


def _select_port(host: str) -> tuple[int, bool]:
    if _is_port_available(host, PRIMARY_PORT):
        return PRIMARY_PORT, False

    if _is_existing_helper(host, PRIMARY_PORT):
        return PRIMARY_PORT, True

    for port in FALLBACK_PORTS:
        if _is_port_available(host, port):
            return port, False

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((host, 0))
        return int(sock.getsockname()[1]), False


def main() -> None:
    port, attach_only = _select_port(HOST)
    url = f"http://{HOST}:{port}"

    if attach_only:
        webbrowser.open(url, new=1)
        return

    stop_event = threading.Event()
    activity_lock = threading.Lock()
    last_activity_at = time.monotonic()

    def stop_requested() -> None:
        stop_event.set()

    def on_activity(_path: str) -> None:
        nonlocal last_activity_at
        with activity_lock:
            last_activity_at = time.monotonic()

    def handle_signal(_signum: int, _frame: object) -> None:
        stop_event.set()

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    AppRequestHandler.on_app_quit = stop_requested
    AppRequestHandler.on_activity = on_activity

    server = ThreadingHTTPServer((HOST, port), AppRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    # Open UI for the user immediately after startup.
    webbrowser.open(url, new=1)

    try:
        while not stop_event.wait(POLL_INTERVAL_SECONDS):
            with activity_lock:
                idle_for = time.monotonic() - last_activity_at
            if idle_for >= IDLE_TIMEOUT_SECONDS:
                stop_event.set()
    finally:
        AppRequestHandler.on_app_quit = None
        AppRequestHandler.on_activity = None
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
