# Home Website

This repo contains the source files for my home website, which is statically generated via Hugo.

## Getting started

Install Hugo Extended. On windows you can use choco:

```ps
choco install go -y
choco install hugo-extended -y
```

Once installed, you can run the project via 

```ps
hugo server -D
```

## Adding a new page

Pages can be added via the Hugo New command

```ps
hugo new posts/my-new-blog-post.md
```

## Serving via home server

Run 

```ps
hugo --minify
```

to build the website. It'll output a full website for you in the `./public` folder.

Copy the entire contents of the `./public` folder to the root folder in your web server.

## Updating the Theme

Run 

```ps
hugo mod get -u
```