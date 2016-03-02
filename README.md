# App Name

#### Requirements
 * npm
 * grunt
 * bower

***

### Getting Started

After you've pulled down the code, just run:
```shell
sh script/setup.sh
```

To make this into its own (new) repository, run:
```shell
grunt init:app-name
```
This will update the `bower.json` & `package.json` files (though it won't figure out the git user on its own).

You will also want to wipe out the git info then re-connect it to the proper repository.

***

While you are working on code, make sure you have grunt running:
```shell
grunt
```

***

### Generate Stones (Components)

##### Basic Usage
To create a new Stone:
```shell
grunt generate:stone --name="Stone Name"
```
**or**
```shell
grunt generate:stone --name=stone-name
```

To remove a stone from the project, use:
```shell
grunt destroy:stone --name=stone-name
```

By default, the generate stone task will create only these files:
```shell
grunt generate:stone --name=stone-name
```
This will result in:
```shell
└── src/stone-name
    ├── stone-name.less
    ├── stone-name.js
    └── stone-name.hbs
```

Generate a stone with a different parent than default
```shell
grunt generate:stone --name=stone-name --parent=pebble
```

##### More Options
```shell
grunt generate:stone --name=stone-name --description="This is going to be an awesome frickin' stone"
```

***

### Generate Pages

_Give it a try!_

##### Basic Usage
To create a new page:
```shell
grunt generate:page --name="Page Name"
```
**or**
```shell
grunt generate:page --name=page-name
```

To remove a page from the project, use:
```shell
grunt destroy:page --name=page-name
```

By default, the generate page task will create only these files:
```shell
└── app/page-name
    ├── index.html
    ├── page-name.hbs
    ├── page-name.js
    └── page-name.less
```

If your page will include JSON data, use:
```shell
grunt generate:page:with-data --name=page-name
```
This will result in:
```shell
└── app/page-name
    ├── index.html
    ├── page-name.hbs
    ├── page-name.js
    ├── page-name.json
    └── page-name.less
```
_Don't forget to include your JSON in your page's dependencies!_

##### More Options
```shell
grunt generate:page --name=page-name --description="This is going to be an awesome frickin' page"

```
