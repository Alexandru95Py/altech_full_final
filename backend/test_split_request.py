import requests

url = "http://127.0.0.1:8000/pro/split/"
file_path = "test_files/sample.pdf"

with open(file_path, "rb") as f:
    files = {"file": f}
    data = {"start_page": 1, "end_page": 1}
    response = requests.post(url, files=files, data=data)

    if response.status_code == 200:
        response_data = response.json()
        file_path = response_data.get("file_path")

        if file_path:
            download_response = requests.get(f"http://127.0.0.1:8000/{file_path}")
            if download_response.status_code == 200:
                with open("test_split_output.pdf", "wb") as output_file:
                    output_file.write(download_response.content)
                print("PDF downloaded successfully as test_split_output.pdf")
            else:
                print(f"Failed to download PDF. Status code: {download_response.status_code}")
        else:
            print("File path not found in response.")
    else:
        print(f"Failed to split PDF. Status code: {response.status_code}")
        print(response.text)
