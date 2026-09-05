def absolute_file_url(request, file_field) -> str | None:
    if not file_field:
        return None
    url = file_field.url
    if request:
        url = request.build_absolute_uri(url)
    if url.startswith("http://") and "localhost" not in url and "127.0.0.1" not in url:
        url = "https://" + url[len("http://") :]
    return url
