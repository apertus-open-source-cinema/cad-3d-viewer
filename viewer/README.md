# 3D CAD viewer (vue.js)

## TODO

- Extend README

## Usage

- Prepare environment

  `npm install`

- Run for development

  `npm run dev`

- Build, _dist/_ folder will contain the result

  `npm run build`

## Structure

### Folders

### Components

### Events

## Proposals

### Part icon loading

|             | Option 1 (JSON data)                                                        | Option 2 (folder-based)                                     | Option 3 (standardized names)                                                |
| ----------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Description | Asset file name is stored <br> in the JSON file                             | Assets are loaded according to the folder name              | Use file names which are the same for every part, has to be folder-based too |
| Example     | Entry in available_parts.json:<br>{<br>...<br>icon: <icon_path><br>...<br>} | Folder name: lens_cap_v5<br>Icon name: lens_cap_v5_icon.png | icon.png                                                                     |
