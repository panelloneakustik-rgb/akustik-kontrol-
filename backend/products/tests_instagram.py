from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from products.instagram import InstagramConfigError, _token, sync_instagram_stories
from products.models import Story


class InstagramStorySyncTests(TestCase):
    @override_settings(INSTAGRAM_ACCESS_TOKEN="", INSTAGRAM_USER_ID="")
    def test_missing_config(self):
        with self.assertRaises(InstagramConfigError):
            _token()

    @override_settings(INSTAGRAM_ACCESS_TOKEN="tok", INSTAGRAM_USER_ID="123", INSTAGRAM_SYNC_LIMIT=4)
    @patch("products.instagram.download_bytes")
    @patch("products.instagram.graph_get")
    def test_sync_creates_video_story(self, mock_get, mock_dl):
        mock_get.side_effect = [
            {"data": []},
            {
                "data": [
                    {
                        "id": "ig-99",
                        "caption": "Yeni sünger reel\nDetay",
                        "media_type": "VIDEO",
                        "media_url": "https://cdn.example/v.mp4",
                        "thumbnail_url": "https://cdn.example/t.jpg",
                        "permalink": "https://www.instagram.com/reel/ABC/",
                    }
                ]
            },
        ]
        mock_dl.side_effect = [
            b"fake-mp4-bytes",
            b"fake-jpg-bytes",
        ]
        result = sync_instagram_stories(limit=4)
        self.assertEqual(result["created"], 1)
        story = Story.objects.get(instagram_id="ig-99")
        self.assertEqual(story.source, "instagram")
        self.assertEqual(story.title, "Yeni sünger reel")
        self.assertTrue(story.video)
        self.assertIn("instagram.com/reel/ABC", story.link_url)

    def test_manual_story_still_saves(self):
        img = SimpleUploadedFile("k.png", b"\x89PNG\r\n\x1a\n" + b"0" * 20, content_type="image/png")
        s = Story.objects.create(title="Elle", image=img, order=9)
        self.assertEqual(s.source, "manual")
        self.assertIsNone(s.instagram_id)
