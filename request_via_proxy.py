import asyncio
import aiohttp
import random
import string

PROXY_FILE = "proxies.txt"
CAPTCHA_URL = "https://testnr.org/numer/api/generate-captcha"
VALIDATE_URL = "https://testnr.org/numer/api/validate-numer"
DELAY_BETWEEN_TASKS = 0.01  # 10 ms
RETRY_DELAY = 1  # seconds


def generate_random_string(length=16):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_random_phone():
    return ''.join(random.choices(string.digits, k=9))


def load_proxy_list(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip().startswith("http")]


async def single_test(session: aiohttp.ClientSession, index: str, proxy: str):
    try:
        async with session.post(CAPTCHA_URL, json={}, proxy=proxy, timeout=10) as captcha_resp:  # noqa: E501
            captcha_text = await captcha_resp.text()
            print(f"\n[{index}] CAPTCHA ({proxy}) {captcha_resp.status}:\n{captcha_text.strip()}")  # noqa: E501

            if captcha_resp.status == 429:
                return "STOP"
            if captcha_resp.status != 200:
                return

            captcha_data = await captcha_resp.json()
            token = captcha_data.get("token")
            code = captcha_data.get("code")

        if not token or not code:
            return

        payload = {
            "numer": generate_random_string(16),
            "phone": generate_random_phone(),
            "captchaToken": token,
            "captchaCode": code
        }

        async with session.post(VALIDATE_URL, json=payload, proxy=proxy, timeout=10) as validate_resp:  # noqa: E501
            text = await validate_resp.text()
            print(f"\n[{index}] VALIDATE ({proxy}) {validate_resp.status}:\n{text.strip()}")  # noqa: E501

            if validate_resp.status == 429:
                return "STOP"

    except aiohttp.ClientConnectionError as _:  # noqa: F841
        return "RETRY"
    except Exception as _:  # noqa: F841
        return "RETRY"


async def worker(worker_id, proxy_url):
    async with aiohttp.ClientSession() as session:
        index = 1
        retry_count = 0
        while True:
            result = await single_test(session, f"{worker_id}.{index}", proxy_url)

            if result == "STOP":
                print(f"*** 429 - {worker_id} ends its life (proxy={proxy_url}) ***")
                return

            if result == "RETRY":
                retry_count += 1
                await asyncio.sleep(RETRY_DELAY)
                continue

            retry_count = 0
            index += 1
            await asyncio.sleep(DELAY_BETWEEN_TASKS)


async def main():
    proxies = load_proxy_list(PROXY_FILE)
    if not proxies:
        print("Brak poprawnych proxy.")
        return

    tasks = []
    for i, proxy in enumerate(proxies):
        task = asyncio.create_task(worker(i + 1, proxy))
        tasks.append(task)

    done, _ = await asyncio.wait(tasks, return_when=asyncio.ALL_COMPLETED)
    print("no workers alive :(")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("KB INTERRUPT Ctrl+C")
