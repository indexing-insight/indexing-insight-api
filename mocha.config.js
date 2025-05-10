// load dotenv
require('dotenv').config({ path: `.env.${process.env.NODE_ENV ?`${process.env.NODE_ENV}` :'local'}` });

// Bootstrap babel-register
require("@babel/register")({
	presets: ["@babel/preset-env"],
	plugins: [
		["@babel/transform-runtime"],
		// [
		// 	"module-resolver",
		// 	{
		// 		"alias": {
		// 			"@": ["./"]
		// 		}
		// 	}
		// ],
	]
})

// Load tests
const glob = require("glob")

let path = "./test/**/*.spec.js"

let pathIndex = process.argv.findIndex((el) => el.startsWith("path="))
if (pathIndex >= 0) {
	path = process.argv[pathIndex].split("=")[1]
}

glob.sync("./" + path).forEach(require)
