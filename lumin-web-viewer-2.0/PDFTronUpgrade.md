# Upgrade to latest version of PDFTron WebViewer UI and Core PDFTron SDK

Lumin forked repository from [PDFTron WebViewer UI](https://github.com/PDFTron/webviewer-ui) built in React with custom UI.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Upgrade](#upgrade)
* [Noted](#noted)
* [Other](#other)

## Prerequisites

Add remote and fetch repository of [PDFTron WebViewer UI](https://github.com/PDFTron/webviewer-ui) from github to local

```
git remote add pdftron git@github.com:PDFTron/webviewer-ui.git

git fetch pdftron
```

We only take care of changed file from components folder in [PDFTron WebViewer UI](https://github.com/PDFTron/webviewer-ui) repo

## Upgrade

## I. Upgrade logic in components
We need to read version [PDFTron Changelog](https://www.pdftron.com/documentation/web/changelog) to update all new features and fixed features. If new features out of scope of Lumin, we need disabled it.

#### 1. Open [version changelog of PDFTron](https://www.pdftron.com/documentation/web/changelog)

#### 2. Choose current version of project and read carefully changelog one by one into version you want to update

#### 3. We update logic in the files related to the changelog in PDFTron webviewer repo to Lumin repo until go to the lasted changelog of PDFTron repo. We can skip file changed in folders ```core```, ```event-listeners```, ```helpers``` but with some file we had been logic inside, we need to updated it by hand. If commit not affect too much to our repo, we can cherry-pick it. Ensure Unit test not to be affected.

#### 4. The final step is we download the new Core of PDFTron SDK, we have 2 options:
##### 1. Download from [PDFTron Nightly Builds](https://www.pdftron.com/nightly/) (Eg. WebViewer-6.3.1_2020-05-20_stable.zip). After download success, we unzip that file and copy all file/folder in ```lib/core```, ```lib/types.d.ts```, ```lib/package.json``` to [lumin-web-core](https://bitbucket.org/nitrolabs/lumin-web-core/src/master/) repo
##### 2. Update version in ```download-webviewer``` scripts in package.json and run ```pnpm run download-webviewer``` and copy contents in folder lib to [lumin-web-core](https://bitbucket.org/nitrolabs/lumin-web-core/src/master/) repo
#### Noted that we need update version like version that [PDFTron Demo](https://www.pdftron.com/webviewer/demo/) using, because some stable release of PDFTron have some issue that they not check before release.


## III. Test

After upgrade success, we only need to test on Viewer. Ensure that old features is still work.
1. Tools create annotation in header
2. Tools appear when right click on document
3. Tools appear when select annotation
4. Thumbnails, Notes, Bookmarks on left panel
5. Custom tool that we implemented (undo/redo)
6. Manipulation on list view and grid view
7. Search contents in right panels

## Noted

Some issues that we need to attention
1. When upgrade we need to check clearly some hooks of PDFTron Core: ```annotationChanged```, ```annotationAdded```, ```fieldChanged```, ```annotationDoubleClicked```, ```pageComplete```, ```documentLoaded```, ```annotationsLoaded```, ```documentReady```, ```locationSelected```. If those hooks have any change we need to update to keep all features work.

## Other

1. PDFTron Viewer Forum: https://groups.google.com/forum/?nomobile=true#!forum/pdfnet-webviewer

2. Support: https://support.pdftron.com/support/tickets/new

3. PDFTron Core API: https://www.pdftron.com/api/web/index.html