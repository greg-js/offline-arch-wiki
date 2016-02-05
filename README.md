_This is a work in progress_

`build-arch-wiki` (`bin/make.js`) scrapes the Arch Wiki TOC, converts articles to markdown and puts them in `./content` or the `-t` target directory. It also accepts a custom wiki TOC link but right now almost everything is hardcoded for the Arch Wiki.

`sync-arch-wiki` (`bin/sync.js`) scrapes the Arch Wiki recent changes and updates the `./content` or `-t` target local wiki copy with the changes since the latest sync.

[arch-wiki-md-repo](https://github.com/greg-js/arch-wiki-md-repo) is the result of running this using custom scripts and a few cron jobs.

[arch-wiki-man](https://github.com/greg-js/arch-wiki-man) uses these modules for browsing and displaying in `man` the whole wiki on the command line.


Theoretically this could be updated to take any wiki but probably the code would have to be optimized first.

Licensed under GPLv3
