self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": [
      {
        "source": "/"
      },
      {
        "source": "/movie/:id/:path*"
      },
      {
        "source": "/tv/:id/:path*"
      },
      {
        "source": "/actor/:id/:path*"
      },
      {
        "source": "/director/:id/:path*"
      },
      {
        "source": "/search/:path*"
      }
    ]
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()