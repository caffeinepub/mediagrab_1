import Text "mo:core/Text";
import Outcall "http-outcalls/outcall";

actor {
  type DownloadOption = {
    quality : Text;
    url : Text;
  };

  type MediaResult = {
    platform : Text;
    title : Text;
    thumbnail : Text;
    options : [DownloadOption];
  };

  type MediaResponse = {
    #ok : MediaResult;
    #err : Text;
  };

  func detectPlatformInternal(url : Text) : Text {
    if (url.contains(#text "youtube.com") or url.contains(#text "youtu.be")) {
      "YouTube";
    } else if (url.contains(#text "instagram.com")) {
      "Instagram";
    } else if (url.contains(#text "facebook.com") or url.contains(#text "fb.watch")) {
      "Facebook";
    } else if (url.contains(#text "tiktok.com")) {
      "TikTok";
    } else if (url.contains(#text "twitter.com") or url.contains(#text "x.com")) {
      "Twitter/X";
    } else if (url.contains(#text "snapchat.com")) {
      "Snapchat";
    } else if (url.contains(#text "pinterest.com") or url.contains(#text "pin.it")) {
      "Pinterest";
    } else if (url.contains(#text "vimeo.com")) {
      "Vimeo";
    } else if (url.contains(#text "reddit.com") or url.contains(#text "redd.it")) {
      "Reddit";
    } else if (url.contains(#text "soundcloud.com")) {
      "SoundCloud";
    } else { "Unknown" };
  };

  public query ({ caller }) func detectPlatform(url : Text) : async Text {
    detectPlatformInternal(url);
  };

  // Transform function for HTTP outcall
  public query ({ caller }) func transformFn(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // Resolve media function
  public shared ({ caller }) func resolveMedia(url : Text) : async Text {
    let platform = detectPlatformInternal(url);
    if (platform == "Unknown") {
      return "Unsupported platform";
    };

    if (not url.contains(#text "http")) {
      return "" # "Invalid URL";
    };

    let body = "{ \"url\": \"" # url # "\", \"vQuality\": \"max\", \"filenamePattern\": \"basic\" }";
    let headers = [{ name = "Content-Type"; value = "application/json" }, { name = "Accept"; value = "application/json" }];

    await Outcall.httpPostRequest(
      "https://co.wuk.sh/api/json",
      headers,
      body,
      transformFn,
    );
  };
};
