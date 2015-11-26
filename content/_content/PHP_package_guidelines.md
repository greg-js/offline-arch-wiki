# PHP package guidelines

From ArchWiki

Jump to: [navigation](#column-one), [search](#searchInput)

**[Package creation guidelines](/index.php/Creating_packages "Creating packages")**

* * *

[CLR](/index.php/CLR_package_guidelines "CLR package guidelines") – [Cross](/index.php/Cross-compiling_tools_package_guidelines "Cross-compiling tools package guidelines") – [Eclipse](/index.php/Eclipse_plugin_package_guidelines "Eclipse plugin package guidelines") – [Free Pascal](/index.php/Free_Pascal_package_guidelines "Free Pascal package guidelines") – [GNOME](/index.php/GNOME_package_guidelines "GNOME package guidelines") – [Go](/index.php/Go_package_guidelines "Go package guidelines") – [Haskell](/index.php/Haskell_package_guidelines "Haskell package guidelines") – [Java](/index.php/Java_package_guidelines "Java package guidelines") – [KDE](/index.php/KDE_package_guidelines "KDE package guidelines") – [Kernel](/index.php/Kernel_module_package_guidelines "Kernel module package guidelines") – [Lisp](/index.php/Lisp_package_guidelines "Lisp package guidelines") – [MinGW](/index.php/MinGW_package_guidelines "MinGW package guidelines") – [Nonfree](/index.php/Nonfree_applications_package_guidelines "Nonfree applications package guidelines") – [OCaml](/index.php/OCaml_package_guidelines "OCaml package guidelines") – [Perl](/index.php/Perl_package_guidelines "Perl package guidelines") – **PHP** – [Python](/index.php/Python_package_guidelines "Python package guidelines") – [Ruby](/index.php/Ruby_Gem_package_guidelines "Ruby Gem package guidelines") – [VCS](/index.php/VCS_package_guidelines "VCS package guidelines") – [Web](/index.php/Web_application_package_guidelines "Web application package guidelines") – [Wine](/index.php/Wine_package_guidelines "Wine package guidelines")

This document covers the creation of [PKGBUILDs](/index.php/PKGBUILD "PKGBUILD") for PHP libraries. The target audience of this document is intended to be packagers of PHP libraries. For PHP Web applications, see [Web application package guidelines](/index.php/Web_application_package_guidelines "Web application package guidelines")

### Package names

For modules the package name should begin with `php-` and the rest of the name should be constructed from the library name by converting it to lowercase and separate words with hyphens. For example the package name corresponding to `File iterator` will be `php-file-iterator`.

### Package file placement

PHP packages should install files into `/usr/share/pear/`. This path is in the Arch Linux default php.ini open_basedir directive.

### Architecture

In most cases, the `arch` array should contain `'any'` because most PHP packages are architecture independent.

Retrieved from "[https://wiki.archlinux.org/index.php?title=PHP_package_guidelines&oldid=386378](https://wiki.archlinux.org/index.php?title=PHP_package_guidelines&oldid=386378)"

[Category](/index.php/Special:Categories "Special:Categories"):

* [Package development](/index.php/Category:Package_development "Category:Package development")