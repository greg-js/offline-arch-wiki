# Arch User Repository

From ArchWiki

Jump to: [navigation](#column-one), [search](#searchInput)

Related articles

* [AUR helpers](/index.php/AUR_helpers "AUR helpers")

* [AurJson](/index.php/AurJson "AurJson")

* [AUR Trusted User Guidelines](/index.php/AUR_Trusted_User_Guidelines "AUR Trusted User Guidelines")

* [PKGBUILD](/index.php/PKGBUILD "PKGBUILD")

* [makepkg](/index.php/Makepkg "Makepkg")

* [pacman](/index.php/Pacman "Pacman")

* [Official repositories](/index.php/Official_repositories "Official repositories")

* [Arch Build System](/index.php/Arch_Build_System "Arch Build System")

* [Creating packages](/index.php/Creating_packages "Creating packages")

The Arch User Repository (AUR) is a community-driven repository for Arch users. It contains package descriptions ([PKGBUILDs](/index.php/PKGBUILD "PKGBUILD")) that allow you to compile a package from source with [makepkg](/index.php/Makepkg "Makepkg") and then install it via [pacman](/index.php/Pacman#Additional_commands "Pacman"). The AUR was created to organize and share new packages from the community and to help expedite popular packages' inclusion into the [community](/index.php/Community "Community") repository. This document explains how users can access and utilize the AUR.

A good number of new packages that enter the official repositories start in the AUR. In the AUR, users are able to contribute their own package builds (PKGBUILD and related files). The AUR community has the ability to vote for or against packages in the AUR. If a package becomes popular enough — provided it has a compatible license and good packaging technique — it may be entered into the _community_ repository (directly accessible by [pacman](/index.php/Pacman "Pacman") or [abs](/index.php/Abs "Abs")).

## Contents

* [1 Getting started](#Getting_started)

* [2 History](#History)

* [3 Searching](#Searching)

* [4 Installing packages](#Installing_packages)
* [4.1 Prerequisites](#Prerequisites)

* [4.2 Acquire build files](#Acquire_build_files)

* [4.3 Build and install the package](#Build_and_install_the_package)

* [5 Feedback](#Feedback)

* [6 Sharing and maintaining packages](#Sharing_and_maintaining_packages)
* [6.1 Submitting packages](#Submitting_packages)
* [6.1.1 Rules of submission](#Rules_of_submission)

* [6.1.2 Creating a new package](#Creating_a_new_package)

* [6.1.3 Updating packages](#Updating_packages)

* [6.2 Maintaining packages](#Maintaining_packages)

* [6.3 Other requests](#Other_requests)

* [7 Git repositories for AUR3 packages](#Git_repositories_for_AUR3_packages)

* [8 AUR metadata](#AUR_metadata)
* [8.1 How it works](#How_it_works)

* [9 AUR translation](#AUR_translation)

* [10 FAQ](#FAQ)
* [10.1 What is the AUR?](#What_is_the_AUR.3F)

* [10.2 What kind of packages are permitted on the AUR?](#What_kind_of_packages_are_permitted_on_the_AUR.3F)

* [10.3 How can I vote for packages in the AUR?](#How_can_I_vote_for_packages_in_the_AUR.3F)

* [10.4 What is a Trusted User / TU?](#What_is_a_Trusted_User_.2F_TU.3F)

* [10.5 What is the difference between the Arch User Repository and the community repository?](#What_is_the_difference_between_the_Arch_User_Repository_and_the_community_repository.3F)

* [10.6 Foo in the AUR is outdated; what do I do?](#Foo_in_the_AUR_is_outdated.3B_what_do_I_do.3F)

* [10.7 Foo in the AUR does not compile when I run makepkg; what should I do?](#Foo_in_the_AUR_does_not_compile_when_I_run_makepkg.3B_what_should_I_do.3F)

* [10.8 How do I make a PKGBUILD?](#How_do_I_make_a_PKGBUILD.3F)

* [10.9 I have a PKGBUILD I would like to submit; can someone check it to see if there are any errors?](#I_have_a_PKGBUILD_I_would_like_to_submit.3B_can_someone_check_it_to_see_if_there_are_any_errors.3F)

* [10.10 How to get a PKGBUILD into the community repository?](#How_to_get_a_PKGBUILD_into_the_community_repository.3F)

* [10.11 How can I speed up repeated build processes?](#How_can_I_speed_up_repeated_build_processes.3F)

* [10.12 What is the difference between foo and foo-git packages?](#What_is_the_difference_between_foo_and_foo-git_packages.3F)

* [10.13 Why has foo disappeared from the AUR?](#Why_has_foo_disappeared_from_the_AUR.3F)

* [10.14 How do I find out if any of my installed packages disappeared from AUR?](#How_do_I_find_out_if_any_of_my_installed_packages_disappeared_from_AUR.3F)

* [11 See also](#See_also)

## Getting started

Users can search and download PKGBUILDs from the [AUR Web Interface](https://aur.archlinux.org). These PKGBUILDs can be built into installable packages using [makepkg](/index.php/Makepkg "Makepkg"), then installed using pacman.

* Ensure the [base-devel](https://www.archlinux.org/groups/x86_64/base-devel/) package group is installed (`pacman -S --needed base-devel`).

* Glance over the [#FAQ](#FAQ) for answers to the most common questions.

* You may wish to adjust `/etc/makepkg.conf` to optimize for your processor prior to building packages from the AUR. A significant improvement in compile times can be realized on systems with multi-core processors by adjusting the MAKEFLAGS variable. Users can also enable hardware-specific optimizations in GCC via the CFLAGS variable. See [makepkg](/index.php/Makepkg "Makepkg") for more information.

## History

In the beginning, there was `ftp://ftp.archlinux.org/incoming`, and people contributed by simply uploading the PKGBUILD, the needed supplementary files, and the built package itself to the server. The package and associated files remained there until a [Package Maintainer](/index.php/Package_Maintainer "Package Maintainer") saw the program and adopted it.

Then the Trusted User Repositories were born. Certain individuals in the community were allowed to host their own repositories for anyone to use. The AUR expanded on this basis, with the aim of making it both more flexible and more usable. In fact, the AUR maintainers are still referred to as TUs (Trusted Users).

Between 2015-06-08 and 2015-08-08 the AUR transitioned from version 3.5.1 to 4.0.0, introducing the use of Git repositories for publishing the PKGBUILDs.

## Searching

The AUR web interface can be found at [https://aur.archlinux.org/](https://aur.archlinux.org/), and an interface suitable for accessing the AUR from a script can be found at [https://aur.archlinux.org/rpc.php](https://aur.archlinux.org/rpc.php).

Queries search package names and descriptions via a MySQL LIKE comparison. This allows for more flexible search criteria (e.g. try searching for `tool%like%grep` instead of `tool like grep`). If you need to search for a description that contains `%`, escape it with `\%`.

## Installing packages

**Warning:** There is not and will never be an _official_ mechanism for installing build material from the AUR. **All AUR users should be familiar with the build process.**

Installing packages from the AUR is a relatively simple process. Essentially:

* Acquire the tarball which contains the [PKGBUILD](/index.php/PKGBUILD "PKGBUILD") and possibly other required files, like [systemd](/index.php/Systemd "Systemd") units and patches (but often not the actual code).

* Extract the tarball (preferably in a folder set aside just for builds from the AUR) with `tar -xvf _pkgname_.tar.gz`.

* Run `makepkg -sri` in the directory where the files are saved. This will download the code, resolve the dependencies with [pacman](/index.php/Pacman "Pacman"), compile it, package it, install the package, and finally remove the build-time dependencies, which are no longer needed.

### Prerequisites

First ensure that the necessary tools are installed:

```
# pacman -S --needed base-devel

```

The package group [base-devel](https://www.archlinux.org/groups/x86_64/base-devel/) should be sufficient; it includes [make](https://www.archlinux.org/packages/?name=make) and other tools needed for compiling from source.

**Warning:** Packages in the AUR assume the [base-devel](https://www.archlinux.org/groups/x86_64/base-devel/) group is installed, and AUR packages will not list members of this group as dependencies even if the package cannot be built without them. Please ensure this group is installed before complaining about failed builds.

Next choose an appropriate build directory. A build directory is simply a directory where the package will be made or "built" and can be any directory. The examples in the following sections will use `~/builds` as the build directory.

### Acquire build files

Locate the package in the AUR. This is done using the search feature (text field at the top of the [AUR home page](https://aur.archlinux.org/)). Clicking the application's name in the search list brings up an information page on the package. Read through the description to confirm that this is the desired package, note when the package was last updated, and read any comments.

There are three well-known methods to aquire the build files without the use of an AUR helper:

* Download the necessary build files by clicking on the "Download snapshot" link under "Package Actions" on the right hand side. This file should be saved to the build directory or otherwise copied to the directory after downloading. In this example, the file is called `foo.tar.gz` (standard format is `_pkgname_.tar.gz`, if it has been properly submitted).

* Alternatively you can download the tarball from the terminal, changing directories to the build directory first:

```
$ cd ~/builds
$ curl -L -O https://aur.archlinux.org/cgit/aur.git/snapshot/foo.tar.gz

```

* It is also possible to clone the [Git](/index.php/Git "Git") repository that is labeled as the "Git Clone URL" in the "Package Details":

```
 $ cd ~/build-repos
 $ git clone [https://aur.archlinux.org/foo.git](https://aur.archlinux.org/foo.git)

```

### Build and install the package

Change directories to the build directory if not already there, then extract the previously downloaded package:

```
$ cd ~/builds
$ tar -xvf foo.tar.gz

```

This should create a new directory called `foo` in the build directory.

**Note:** In the case of a git clone, the extraction process is unnecessary. The git clone has already created the directory `foo`.

**Warning:** **Carefully check all files.** `cd` to the newly created directory and carefully check the `PKGBUILD` and any `.install` file for malicious commands. `PKGBUILD`s are [bash](/index.php/Bash "Bash") scripts containing functions to be executed by _makepkg_: these functions can contain _any_ valid commands or Bash syntax, so it is totally possible for a `PKGBUILD` to contain dangerous commands through malice or ignorance on the part of the author. Since _makepkg_ uses _fakeroot_ (and should never be run as root), there is some level of protection but you should never count on it. If in doubt, do not build the package and seek advice on the forums or mailing list.

```
$ cd foo
$ nano PKGBUILD
$ nano foo.install

```

Make the package. After manually confirming the integrity of the files, run [makepkg](/index.php/Makepkg "Makepkg") as a normal user:

```
$ makepkg -sri

```

The `-s`/`--syncdeps` switch will automatically resolve and install any dependencies with [pacman](/index.php/Pacman "Pacman") before building, `-r`/`--rmdeps` removes the build-time dependencies after build, as they are no longer needed, and `-i`/`--install` will install the package itself.

**Note:** The above example is only a brief summary of the build process. It is **highly** recommended to read the [makepkg](/index.php/Makepkg "Makepkg") and [ABS](/index.php/ABS "ABS") articles for more details.

## Feedback

The [AUR Web Interface](https://aur.archlinux.org) has a comments facility that allows users to provide suggestions and feedback on improvements to the PKGBUILD contributor. Avoid pasting patches or PKGBUILDs into the comments section: they quickly become obsolete and just end up needlessly taking up lots of space. Instead email those files to the maintainer, or even use a [pastebin](/index.php/Pastebin "Pastebin").

One of the easiest activities for **all** Arch users is to browse the AUR and **vote** for their favourite packages using the online interface. All packages are eligible for adoption by a TU for inclusion in the [community](/index.php/Community "Community") repository, and the vote count is one of the considerations in that process; it is in everyone's interest to vote!

## Sharing and maintaining packages

**Note:** Please see [Talk:Arch User Repository#Scope of the AUR4 section](/index.php/Talk:Arch_User_Repository#Scope_of_the_AUR4_section "Talk:Arch User Repository") before making changes to this section.

Users can **share** PKGBUILDs using the Arch User Repository. It does not contain any binary packages but allows users to upload PKGBUILDs that can be downloaded by others. These PKGBUILDs are completely unofficial and have not been thoroughly vetted, so they should be used at your own risk.

### Submitting packages

**Warning:** Before attempting to submit a package you are expected to familiarize yourself with [Arch packaging standards](/index.php/Arch_packaging_standards "Arch packaging standards") and all the articles under "Related articles".

#### Rules of submission

When submitting a package, observe the following rules:

* Check the [official package database](https://www.archlinux.org/packages/) for the package. If **any version** of it exists, **do not** submit the package. If the official package is out-of-date, flag it as such. If the official package is broken or is lacking a feature, then please file a [bug report](https://bugs.archlinux.org/).

* Check the AUR for the package. If it is currently maintained, changes can be submitted in a comment for the maintainer's attention. If it is unmaintained, the package can be adopted and updated as required. Do not create duplicate packages.

* Verify carefully that what you are uploading is correct. All contributors must read and adhere to the [Arch packaging standards](/index.php/Arch_packaging_standards "Arch packaging standards") when writing PKGBUILDs. This is essential to the smooth running and general success of the AUR. Remember that you are not going to earn any credit or respect from your peers by wasting their time with a bad PKGBUILD.

* Packages that contain binaries or that are very poorly written may be deleted without warning.

* If you are unsure about the package (or the build/submission process) in any way, submit the PKGBUILD to the [AUR mailing list](https://mailman.archlinux.org/mailman/listinfo/aur-general) or the [AUR forum](https://bbs.archlinux.org/viewforum.php?id=4) on the Arch forums for public review before adding it to the AUR.

* Make sure the package is useful. Will anyone else want to use this package? Is it extremely specialized? If more than a few people would find this package useful, it is appropriate for submission.

* The AUR and official repositories are intended for packages which install generally software and software-related content, including one or more of the following: executable(s); config file(s); online or offline documentation for specific software or the Arch Linux distribution as a whole; media intended to be used directly by software.

* Gain some experience before submitting packages. Build a few packages to learn the process and then submit.

#### Creating a new package

For write access to the AUR users need to have an [SSH key](/index.php/SSH_keys "SSH keys"). The contents of a public key `.ssh/foo.pub` need to be copied to the user profile in _My Account_. It is recommended that you create a new key, rather than use an existing SSH key so that you could selectively revoke the SSH key should something happen.

In order to upload a package, simply clone the Git repository with the corresponding name:

```
$ git clone ssh://aur@aur.archlinux.org/_foobar_.git

```

Cloning from, or pushing to, a non-existing repository will automatically create a new one.

You can now add the source files to the local copy of the Git repository. When making changes to the repository, make sure you always include the `PKGBUILD` and `.SRCINFO` in the top-level directory. You can create `.SRCINFO` files using `mksrcinfo`, provided by [pkgbuild-introspection](https://www.archlinux.org/packages/?name=pkgbuild-introspection).

**Note:** `.SRCINFO` contains source package metadata, see [#AUR metadata](#AUR_metadata) for details.

#### Updating packages

In order to submit new versions of a package base to the AUR, add the new `PKGBUILD`, `.SRCINFO` and possibly helper files (like `.install` files or local source files like `.patch`) to the _staging area_ with `git add`, commit them to your local tree with a commit message with `git commit`, and finally publish the changes to the AUR with `git push`.

For example, to create and submit the initial commit:

```
$ mksrcinfo
$ git add _PKGBUILD .SRCINFO_
$ git commit -m 'Initial import'
$ git push origin master

```

**Warning:** If you do not want to publish your system-wide identity, do not forget to set a local user name and email address via `git config user.name [...]` and `git config user.email [...]`! It is much more difficult to rewrite already published history, see: [FS#45425](https://bugs.archlinux.org/task/45425). Review your commits before pushing them!

To update a package, edit the `PKGBUILD` and run the following commands to track the changes in the AUR Git repository:

```
$ mksrcinfo
$ git commit -am 'Update to _1.0.0-2'_
$ git push

```

See [Git](/index.php/Git "Git") for more information.

**Tip:** If you forget to commit the `.SRCINFO` and add it in a later commit, the AUR will still reject your pushes because the `.SRCINFO` must exist for _every_ commit. To solve this problem you can use [git rebase](https://git-scm.com/docs/git-rebase) with the `--root` option or [git filter-branch](https://git-scm.com/docs/git-filter-branch) with the `--tree-filter` option.

### Maintaining packages

* If you maintain a package and want to update the PKGBUILD for your package just resubmit it.

* Check for feedback and comments from other users and try to incorporate any improvements they suggest; consider it a learning process!

* Please do not leave a comment containing the version number every time you update the package. This keeps the comment section usable for valuable content mentioned above. [AUR helpers](/index.php/AUR_helpers "AUR helpers") are suited better to check for updates.

* Please do not just submit and forget about packages! It is the maintainer's job to maintain the package by checking for updates and improving the PKGBUILD.

* If you do not want to continue to maintain the package for some reason, `disown` the package using the AUR web interface and/or post a message to the AUR Mailing List.

### Other requests

* Disownment requests and removal requests can be created by clicking on the "File Request" link under "Package actions" on the right hand side. This automatically sends a notification email to the current package maintainer and to the [aur-requests mailing list](https://mailman.archlinux.org/mailman/listinfo/aur-requests) for discussion. [Trusted Users](/index.php/Trusted_Users "Trusted Users") will then either accept or reject the request.

* Disownment requests will be granted after two weeks if the current maintainer did not react.

* **Package merging has been implemented**, users still have to resubmit a package under a new name and may request merging of the old version's comments and votes.

* Removal requests require the following information:
* Reason for deletion, at least a short note  
**Notice:** A package's comments does not sufficiently point out the reasons why a package is up for deletion. Because as soon as a TU takes action, the only place where such information can be obtained is the aur-requests mailing list.

* Supporting details, like when a package is provided by another package, if you are the maintainer yourself, it is renamed and the original owner agreed, etc.

* For merge requests: Name of the package base to merge into.

Removal requests can be disapproved, in which case you will likely be advised to disown the package for a future packager's reference.

## Git repositories for AUR3 packages

On 08/08/2015 unmaintained packages have been removed from the AUR with the migration to a [Git](/index.php/Git "Git") backend. A [Git](/index.php/Git "Git") repository of the old AUR contents is available at `git://pkgbuild.com/aur-mirror.git`. It was generally updated once per day and is now read-only. If the repository's [commit history](http://git-scm.com/book/en/Git-Basics-Viewing-the-Commit-History) is not needed, then cloning with the `--depth=1` option will be much quicker:

```
$ git clone --depth=1 git://pkgbuild.com/aur-mirror.git

```

You can also visit `http://pkgbuild.com/git/aur-mirror.git/tree/<packagename>` directly as trying to load `http://pkgbuild.com/git/aur-mirror.git/tree` in a web browser is going to use a lot of time and memory.

For more information, see the following: [Git Web interface](http://pkgbuild.com/git/aur-mirror.git/), [forum thread](https://bbs.archlinux.org/viewtopic.php?id=113099).

There is also the [AUR Archive](https://github.com/aur-archive) on GitHub with a repository for every package that was in AUR 3 during the migration to AUR 4.

## AUR metadata

[![Tango-mail-mark-junk.png](/images/e/e7/Tango-mail-mark-junk.png)](/index.php/File:Tango-mail-mark-junk.png)

[![Tango-mail-mark-junk.png](/images/e/e7/Tango-mail-mark-junk.png)](/index.php/File:Tango-mail-mark-junk.png)

**This article or section needs language, wiki syntax or style improvements.**

**Reason:** This section was originally in a separate page, it may need adaptations to better fit into this article. (Discuss in [Talk:Arch User Repository#](https://wiki.archlinux.org/index.php/Talk:Arch_User_Repository))

In order to display information in the [AUR](/index.php/AUR "AUR") web interface, the AUR's back-end code attempts to parse [PKGBUILD](/index.php/PKGBUILD "PKGBUILD") files and salvage package name, version, and other information from it. `PKGBUILD`s are [Bash](/index.php/Bash "Bash") scripts, and correctly parsing Bash scripts without executing them is a huge challenge, which is why [makepkg](/index.php/Makepkg "Makepkg") is a Bash script itself: it includes the PKGBUILD of the package being built via the `source` directive. AUR metadata files were created to get rid of some hacks, used by AUR package maintainers to work around incorrect parsing in the web interface. See also [FS#25210](https://bugs.archlinux.org/task/25210), [FS#15043](https://bugs.archlinux.org/task/15043), and [FS#16394](https://bugs.archlinux.org/task/16394).

### How it works

By adding a metadata file called `.SRCINFO` to source tarballs to overwrite specific PKGBUILD fields. An outdated format of this file was described in the [AUR 2.1.0 release announcement](https://mailman.archlinux.org/pipermail/aur-dev/2013-March/002428.html). `.SRCINFO` files are parsed line-by-line. The syntax for each line is `key[_arch] = value`. Exactly one space must be on each side of the equals sign, even for an empty value, and do not include quotes around the values.

The `key` is a field name, based on the names of the corresponding [PKGBUILD Variables](/index.php/PKGBUILD_Variables "PKGBUILD Variables"). Some field names may optionally be suffixed with an architecture name. Fields are grouped into sections, each headed by one of the following two field names:

* pkgbase: This is required by AUR 3, otherwise the infamous “only lowercase letters are allowed” error is reported. (Pacman uses the first _pkgname_ if _pkgbase_ is omitted.) Repeat pkgname if unsure. There is only one _pkgbase_ section. The field values from this section are inherited unless overridden in the _pkgname_ sections that follow it. An empty field value in the _pkgname_ section cancels the inheritance.

* pkgname: There may be multiple _pkgname_ sections.

The following field names are associated with a single value for the section:

* epoch

* pkgver: package version, may be formatted as [_epoch_:]_pkgver_ if the epoch field is not given separately

* pkgrel: release number of the package specific to Arch Linux

* pkgdesc

* url

The following field names may be repeated on multiple lines in a section to add multiple values:

* license: in case of multiple licenses separate them by a space

* groups

The following field names may be repeated, and also may optionally have an architecture suffix, separated from the field name by an underscore:

* depends: dependencies, one per line

* makedepends

* checkdepends

* optdepends

* conflicts

* provides

* replaces

* source

Fields with other names are ignored. Blank lines and comment lines beginning with a hash sign (#) are also ignored. Lines may be indented. This format closely matches the `.PKGINFO` format that is used for binary packages in [pacman](/index.php/Pacman "Pacman")/libalpm.

The `.SRCINFO` can also be created from the `PKGBUILD` with `mksrcinfo` from [pkgbuild-introspection](https://www.archlinux.org/packages/?name=pkgbuild-introspection).

## AUR translation

See [TRANSLATING](https://projects.archlinux.org/aurweb.git/tree/TRANSLATING) in the AUR source tree for information about creating and maintaining translation of the AUR web interface.

## FAQ

### What is the AUR?

The AUR (Arch User Repository) is a place where the Arch Linux community can upload [PKGBUILDs](/index.php/PKGBUILD "PKGBUILD") of applications, libraries, etc., and share them with the entire community. Fellow users can then vote for their favorites to be moved into the [community](/index.php/Community "Community") repository to be shared with Arch Linux users in binary form.

### What kind of packages are permitted on the AUR?

The packages on the AUR are merely "build scripts", i.e. recipes to build binaries for pacman. For most cases, everything is permitted, subject to the abovementioned [usefulness and scope guidelines](#Rules_of_submission), as long as you are in compliance with the licensing terms of the content. For other cases, where it is mentioned that "you may not link" to downloads, i.e. contents that are not redistributable, you may only use the file name itself as the source. This means and requires that users already have the restricted source in the build directory prior to building the package. When in doubt, ask.

### How can I vote for packages in the AUR?

Sign up on the [AUR website](https://aur.archlinux.org/) to get a "Vote for this package" option while browsing packages. After signing up it is also possible to vote from the commandline with [aurvote-git](https://aur.archlinux.org/packages/aurvote-git/)<sup><small>AUR</small></sup>.

### What is a Trusted User / TU?

A [Trusted User](/index.php/AUR_Trusted_User_Guidelines "AUR Trusted User Guidelines"), in short TU, is a person who is chosen to oversee AUR and the [community](/index.php/Community "Community") repository. They are the ones who maintain popular PKGBUILDs in _community_, and overall keep the AUR running.

### What is the difference between the Arch User Repository and the community repository?

The Arch User Repository is where all PKGBUILDs that users submit are stored, and must be built manually with [makepkg](/index.php/Makepkg "Makepkg"). When PKGBUILDs receive enough community interest and the support of a TU, they are moved into the [community](/index.php/Community "Community") repository (maintained by the TUs), where the binary packages can be installed with [pacman](/index.php/Pacman "Pacman").

### Foo in the AUR is outdated; what do I do?

For starters, you can flag packages out-of-date. If it stays out-of-date for an extended period of time, the best thing to do is email the maintainer. If there is no response from the maintainer after two weeks, you can file an orphan request. When we are talking about a package which is flagged out of date for more than 3 months and is in general not updated for a long time, please add this in your orphan request.

In the meantime, you can try updating the package yourself by editing the PKGBUILD - sometimes updates do not require any changes to the build or package process, in which case simply updating the `pkgver` or `source` array is sufficient.

### Foo in the AUR does not compile when I run makepkg; what should I do?

You are probably missing something trivial.

* Run `pacman -Syyu` before compiling anything with `makepkg` as the problem may be that your system is not up-to-date.

* Ensure you have both "base" and "base-devel" groups installed.

* Try using the "`-s`" option with `makepkg` to check and install all the dependencies needed before starting the build process.

Be sure to first read the PKGBUILD and the comments on the AUR page of the package in question. The reason might not be trivial after all. Custom CFLAGS, LDFLAGS and MAKEFLAGS can cause failures. It is also possible that the PKGBUILD is broken for everyone. If you cannot figure it out on your own, just report it to the maintainer e.g. by posting the errors you are getting in the comments on the AUR page.

### How do I make a PKGBUILD?

The best resource is the wiki page about [creating packages](/index.php/Creating_packages "Creating packages"). Remember to look in AUR before creating the PKGBUILD as to not duplicate efforts.

### I have a PKGBUILD I would like to submit; can someone check it to see if there are any errors?

If you would like to have your PKGBUILD critiqued, post it on the [aur-general mailing list](https://mailman.archlinux.org/mailman/listinfo/aur-general) to get feedback from the TUs and fellow AUR members. You could also get help from the [IRC channel](/index.php/IRC_channel "IRC channel"), #archlinux on irc.freenode.net. You can also use [namcap](/index.php/Namcap "Namcap") to check your PKGBUILD and the resulting package for errors.

### How to get a PKGBUILD into the community repository?

Usually, at least 10 votes are required for something to move into [community](/index.php/Community "Community"). However, if a TU wants to support a package, it will often be found in the repository.

Reaching the required minimum of votes is not the only requirement, there has to be a TU willing to maintain the package. TUs are not required to move a package into the _community_ repository even if it has thousands of votes.

Usually when a very popular package stays in the AUR it is because:

* Arch Linux already has another version of a package in the repositories

* The package is AUR-centric (e.g. an [AUR helper](/index.php/AUR_helper "AUR helper"))

* Its license prohibits redistribution

See also [DeveloperWiki:Community repo candidates](/index.php/DeveloperWiki:Community_repo_candidates "DeveloperWiki:Community repo candidates") and [Rules for Packages Entering the community Repo](/index.php/AUR_Trusted_User_Guidelines#Rules_for_Packages_Entering_the_.5Bcommunity.5D_Repo "AUR Trusted User Guidelines").

### How can I speed up repeated build processes?

If you frequently compile code that uses GCC - say, a Git or SVN package - you may find [ccache](/index.php/Ccache "Ccache"), short for "compiler cache", useful.

### What is the difference between foo and foo-git packages?

Many AUR packages are presented in regular ("stable") and development versions ("unstable"). A development package usually has a suffix such as `-cvs`, `-svn`, `-git`, `-hg`, `-bzr` or `-darcs`. While development packages are not intended for regular use, they may offer new features or bugfixes. Because these packages download the latest available source when you execute `makepkg`, a package version to track possible updates is not directly available for these. Likewise, these packages cannot perform an authenticity checksum, instead it is relied on the maintainer(s) of the Git repository.

See also [Enhancing Arch Linux Stability#Avoid development packages](/index.php/Enhancing_Arch_Linux_Stability#Avoid_development_packages "Enhancing Arch Linux Stability").

### Why has foo disappeared from the AUR?

Packages may be deleted, if they did not fulfill the [#Rules of submission](#Rules_of_submission). See the [aur-requests archives](https://lists.archlinux.org/pipermail/aur-requests/) for the reason for deletion.

If the package used to exist in AUR3, it might not have been [migrated to AUR4](https://lists.archlinux.org/pipermail/aur-general/2015-August/031322.html). See the [#Git repositories for AUR3 packages](#Git_repositories_for_AUR3_packages) where these are preserved.

### How do I find out if any of my installed packages disappeared from AUR?

You can use the following script:

```
$ for pkg in $(pacman -Qqm); do cower -s $pkg &>/dev/null || echo "$pkg not in AUR"; done

```

(retrieved from [https://bbs.archlinux.org/viewtopic.php?id=202160](https://bbs.archlinux.org/viewtopic.php?id=202160))

## See also

* [AUR Web Interface](https://aur.archlinux.org)

* [AUR Mailing List](https://www.archlinux.org/mailman/listinfo/aur-general)

* [AUR Mirror Git repository](http://pkgbuild.com/git/aur-mirror.git/)

Retrieved from "[https://wiki.archlinux.org/index.php?title=Arch_User_Repository&oldid=409060](https://wiki.archlinux.org/index.php?title=Arch_User_Repository&oldid=409060)"

[Categories](/index.php/Special:Categories "Special:Categories"):

* [Arch User Repository](/index.php/Category:Arch_User_Repository "Category:Arch User Repository")

* [Package development](/index.php/Category:Package_development "Category:Package development")

* [Package management](/index.php/Category:Package_management "Category:Package management")