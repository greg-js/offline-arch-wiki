# Ruby Gem package guidelines

From ArchWiki

Jump to: [navigation](#column-one), [search](#searchInput)

**[Package creation guidelines](/index.php/Creating_packages "Creating packages")**

* * *

[CLR](/index.php/CLR_package_guidelines "CLR package guidelines") – [Cross](/index.php/Cross-compiling_tools_package_guidelines "Cross-compiling tools package guidelines") – [Eclipse](/index.php/Eclipse_plugin_package_guidelines "Eclipse plugin package guidelines") – [Free Pascal](/index.php/Free_Pascal_package_guidelines "Free Pascal package guidelines") – [GNOME](/index.php/GNOME_package_guidelines "GNOME package guidelines") – [Go](/index.php/Go_package_guidelines "Go package guidelines") – [Haskell](/index.php/Haskell_package_guidelines "Haskell package guidelines") – [Java](/index.php/Java_package_guidelines "Java package guidelines") – [KDE](/index.php/KDE_package_guidelines "KDE package guidelines") – [Kernel](/index.php/Kernel_module_package_guidelines "Kernel module package guidelines") – [Lisp](/index.php/Lisp_package_guidelines "Lisp package guidelines") – [MinGW](/index.php/MinGW_package_guidelines "MinGW package guidelines") – [Nonfree](/index.php/Nonfree_applications_package_guidelines "Nonfree applications package guidelines") – [OCaml](/index.php/OCaml_package_guidelines "OCaml package guidelines") – [Perl](/index.php/Perl_package_guidelines "Perl package guidelines") – [PHP](/index.php/PHP_package_guidelines "PHP package guidelines") – [Python](/index.php/Python_package_guidelines "Python package guidelines") – **Ruby** – [VCS](/index.php/VCS_package_guidelines "VCS package guidelines") – [Web](/index.php/Web_application_package_guidelines "Web application package guidelines") – [Wine](/index.php/Wine_package_guidelines "Wine package guidelines")

Writing [PKGBUILDs](/index.php/PKGBUILD "PKGBUILD") for software written in [Ruby](/index.php/Ruby "Ruby").

## Contents

* [1 Package naming](#Package_naming)
* [1.1 Versioned packages](#Versioned_packages)

* [2 Examples](#Examples)

* [3 Notes](#Notes)
* [3.1 Quarry](#Quarry)

* [4 Gotchas](#Gotchas)
* [4.1 Package contains reference to $pkgdir](#Package_contains_reference_to_.24pkgdir)

* [5 Automation](#Automation)

## Package naming

For libraries, use `ruby-$gemname`. For applications, use the program name. In either case, the name should be entirely lowercase.

Always use `ruby-` prefix even if `$gemname` already starts with word `ruby`. It is needed to avoid future name clashes in case if a gem with shorter name appear. It also makes names more easily parseble by tools (think about PKGBUILD generators/version or dependency checkers, etc...). Examples: [ruby-ruby-protocol-buffers](https://aur.archlinux.org/packages/ruby-ruby-protocol-buffers/)<sup><small>AUR</small></sup><sup>[[broken link](/index.php/ArchWiki:Requests#Broken_package_links "ArchWiki:Requests"): archived in [aur-mirror](http://pkgbuild.com/git/aur-mirror.git/tree/ruby-ruby-protocol-buffers)]</sup>.

### Versioned packages

If you need to add a versioned package then use `ruby-$gemname-$version`, e.g. `ruby-builder-3.2.1`. So rubygem dependency `builder=3.2.1` will turn into `ruby-builder-3.2.1` Arch package.

In case if you need to resolve "approximately greater" dependency `~>` then package should use version without the last part, e.g. rubygem dependency `builder~>3.2.1` will turn into `ruby-builder-3.2`. An exception for this rule is when "approximately greater" dependency matches the latest version of the gem - in this case avoid introducing a new versioned package and use just `ruby-$gemname` instead (the HEAD version).

Another problem with versioned packages is that it can conflict with other versions, e.g. because the packages install the same files in `/usr/bin`. One solution for this problem is that versioned packages should not install such files - only HEAD version package can do this.

## Examples

For examples, please see [ruby-rethinkdb](https://aur.archlinux.org/packages/ruby-rethinkdb/)<sup><small>AUR</small></sup><sup>[[broken link](/index.php/ArchWiki:Requests#Broken_package_links "ArchWiki:Requests"): archived in [aur-mirror](http://pkgbuild.com/git/aur-mirror.git/tree/ruby-rethinkdb)]</sup> [ruby-json_pure](https://aur.archlinux.org/packages/ruby-json_pure/)<sup><small>AUR</small></sup> [ruby-hpricot](https://www.archlinux.org/packages/?name=ruby-hpricot).

## Notes

Add `--verbose` to **gem** arguments to receive additional information in case of troubles.

**Note:** Usage of `--no-user-install` **gem** argument is mandatory since latest Ruby versions (See [FS#28681](https://bugs.archlinux.org/task/28681) for details).

### Quarry

As an alternative to manually managing gemfiles, you might also want to consider quarry, a non-official repository of pre-built binary arch packages. See [Quarry](/index.php/Quarry "Quarry") for details.

## Gotchas

### Package contains reference to $pkgdir

Sometimes when you build the package you can see following warning `WARNING: Package contains reference to $pkgdir`. Some packed files contain absolute path of directory where you built the package. To find these files run `cd pkg && grep -R "$(pwd)" .` Most likely the reason will be hardcoded path in `.../ext/Makefile`.

**Note:** folder `ext` contains native extension code usually written in C. During the package installation rubygems generates a Makefile using `mkmf` library. Then `make` is called, it compiles a shared library and copies one to `lib` gem directory.

After `gem install` is over the `Makefile` is not needed anymore. In fact none of the files in `ext` is needed and it can be completely removed by adding `rm -rf "$pkgdir/$_gemdir/gems/$_gemname-$pkgver/ext"` to `package()` function.

## Automation

The gem installation can be automated completely with the tool [pacgem](https://aur.archlinux.org/packages/pacgem/)<sup><small>AUR</small></sup> which creates a temporary PKGBUILD, calls [makepkg](/index.php/Makepkg "Makepkg") and [namcap](/index.php/Namcap "Namcap"). The resulting package is then installed with `sudo pacman`.

There is also [gem2arch](https://aur.archlinux.org/packages/gem2arch/)<sup><small>AUR</small></sup> tools which aid in automating the process of creating a ruby gem PKGBUILD. Make sure to manually check the PKGBUILD after generation.

Retrieved from "[https://wiki.archlinux.org/index.php?title=Ruby_Gem_package_guidelines&oldid=408720](https://wiki.archlinux.org/index.php?title=Ruby_Gem_package_guidelines&oldid=408720)"

[Category](/index.php/Special:Categories "Special:Categories"):

* [Package development](/index.php/Category:Package_development "Category:Package development")