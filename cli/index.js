#!/usr/bin/env node

// Imports.
const commander = require('commander');
const chalk = require('chalk');
const jsonfile = require('jsonfile');
const fs = require('fs');
const inquirer = require('inquirer');
const utils = require('./utils');
const path = require('path');
const mergedirs = require('merge-dirs').default;

// Define App.
commander.version('1.0.0').description('Buuk CLI');

/**
 * Command: init
 *
 * Usage: init|i [options] <folder>
 * Initialize buuk entry and output folders.
 * Options:
 *      -h, --help  output usage information
 *
 */
commander
    .command('init <folder>')
    .alias('i')
    .description('Initialize a buuk project.')
    .action(folder => {
        try {
            if (fs.existsSync(folder)) {
                // If folder already exists, ask if we should override it.
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'folderDoesExist',
                            message: 'The folder you have specified already exists. Override it?',
                            default: false
                        }
                    ])
                    .then(a => {
                        if (a.folderDoesExist) {
                            utils._scaffoldDestinationFolder(folder);
                        } else {
                            process.exit(1);
                        }
                    })
                    .catch(e => console.warn(e));
            } else {
                // If the folder doesn't exist, just scaffold the damn thing.
                utils._scaffoldDestinationFolder(folder);
            }
        } catch (e) {
            console.log(chalk.red('Error when trying to initialize Buuk project. See log below:'));
            console.log(e);
        }
    });

/**
 * Command: build
 *
 * Usage: build|b [options]
 * Bundle your documentation under /dist. Built files are meant to be served over an HTTP server.
 * Options:
 *      -h, --help  output usage information
 *
 */
commander
    .command('build')
    .alias('b')
    .description('Bundle your documentation under /dist.')
    .action(() => {
        if (fs.existsSync('.buukrc.json')) {
            // Overwrite last cli/.buukrc.json with the one currently being summoned.
            jsonfile.writeFileSync(`${__dirname}/.buukrc.json`, JSON.parse(fs.readFileSync('.buukrc.json', 'utf8')), {
                spaces: 2,
                EOL: '\r\n'
            });

            // Overwrite web-manifest.json with something that has the right values from buuk-config.
            jsonfile.writeFileSync(`${path.join(__dirname, '../static', 'manifest.json')}`, require('./web-manifest'), {
                spaces: 2,
                EOL: '\r\n'
            });

            // Merge static folders.
            mergedirs('static', path.join(__dirname, '..', 'static'), 'overwrite');

            // Pack everything.
            require('../build/build');
        } else {
            console.log(
                chalk.red('No .buukrc found! Make sure you execute this command in a buuk initialized folder.')
            );
            process.exit(1);
        }
    });

/**
 * Command: watch
 *
 * Usage: watch|w [options]
 * Watch for changes in any of the resolved files.
 * Options:
 *      -h, --help  output usage information
 *
 */
commander
    .command('watch')
    .alias('w')
    .description('Watch for changes in any of the resolved files.')
    .action(() => {
        if (fs.existsSync('.buukrc.json')) {
            // Overwrite last cli/.buukrc.json with the one currently being summoned.
            jsonfile.writeFileSync(`${__dirname}/.buukrc.json`, JSON.parse(fs.readFileSync('.buukrc.json', 'utf8')), {
                spaces: 2,
                EOL: '\r\n'
            });

            // Watch everything.
            require('../build/dev-server');
        } else {
            console.log(
                chalk.red('No .buukrc found! Make sure you execute this command in a buuk initialized folder.')
            );
            process.exit(1);
        }
    });

// Parse options.
commander.parse(process.argv);

// Show help command if only buuk is called.
if (!process.argv.slice(2).length) {
    commander.help();
}
