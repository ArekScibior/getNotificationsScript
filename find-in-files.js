var fs = require('fs');
var _ = require('underscore');
var findInFiles = require('find-in-files');

var searchNotyfications = function(typeENG, typeCode, typePL, dir) {
    var indexFiles = 0;
    findInFiles.find("", '.', 'Logs.xtend$')
        .then(function (results) {
            for (var result in results) {
                if (!_.isObject(result)) {
                    var dirName = result;
                    var indexStartFile = _.lastIndexOf(result, "\\")
                    var fileNameCut = result.substr(indexStartFile+1, result.length)
                }
                var res = results[result];
                var finnalyStr = ""
                var tableString = [];
                var index = 0;

                //filtruje linie tak aby miały co najmniej 4 znaki (mogą zawierac litery i cyfry). 
                var regExp = /[a-z0-9_ ]{4,}/
                res.line = _.filter(res.line, function(line) {
                    return regExp.test(line)
                })

                for(var i=0; i < res.line.length; i++) {
                    var splittedArr = _.filter(res.line[i].split(''), function(el) {
                        return el != '	'
                    })
                    
                    var line = splittedArr.join('')
                    var fstRegEx = new RegExp("\\" + typeENG+ '\\(')
                    var secRegEx = new RegExp("\\" + typeENG+ "\\(")

                    //sprawdzam czy dana linia posiada kluczowe słowo: error/warning/success
                    if (fstRegEx.test(line) || secRegEx.test(line)) {  
                        index++;
                        var lineSplitted = line.split('')

                        //sprawdzam czy aktualna linia kończy się ciągiem znaków '('
                        if (line.indexOf(typeENG + '(') && (_.last(lineSplitted) == "(" || _.last(lineSplitted) == "('")) {

                            var nextLine = res.line[i+1]
                            var nextSplittedLine = _.filter(res.line[i+1].split(''), function(el) {
                                return el != '	'
                            })

                            //ustawiam końcowy index dla następnej linii.
                            if (nextLine.indexOf('")') > -1) {
                                var indexEnd = nextLine.indexOf('")')
                            } else if (_.lastIndexOf(nextLine, '",') > -1) {
                                var indexEnd = _.lastIndexOf(nextLine, '",')
                            } else if (_.lastIndexOf(nextLine, "',") > -1) {
                                var indexEnd = _.lastIndexOf(nextLine, "',")
                            } else if (_.lastIndexOf(nextLine, '"') > -1) {
                                var indexEnd = _.lastIndexOf(nextLine, '"')
                            } else if (_.lastIndexOf(nextLine, "'") > -1) {
                                var indexEnd = _.lastIndexOf(nextLine, "'")
                            }
                            //jezeli aktualna linia konczy się otwartym nawiasem to sprawdzam czy nastepna linia zaczyna się od komunikatu '""
                            if (_.first(nextSplittedLine) == "'" || _.first(nextSplittedLine) == '"') {
                                var indexStart = nextLine.indexOf('"')
                                if (indexStart == -1) { indexStart = nextLine.indexOf("'")}
                                var resultStr = nextLine.slice(indexStart+1, indexEnd)
                                var stringToTable = index + ". \t" + dirName + " \t" + typePL + " \t" + typeCode + " \t " + resultStr + '\n'
                                var stringToTableWithoutIndex = dirName + " \t" + typePL + " \t" + typeCode + " \t " + resultStr + '\n'
                                if (stringToTable.indexOf('", "') > -1) {
                                    stringToTable = stringToTable.replace('", "', "")
                                }
                            }
                        } else {
                            //ustawiam końcowy index dla aktualnie linii.
                            if (line.indexOf('")') > -1) {
                                var indexEnd = line.indexOf('")')
                            } else if (_.lastIndexOf(line, '",') > -1) {
                                var indexEnd = _.lastIndexOf(line, '",')
                            } else if (_.lastIndexOf(line, "',") > -1) {
                                var indexEnd = _.lastIndexOf(line, "',")
                            } else if (_.lastIndexOf(line, '"') > -1) {
                                var indexEnd = _.lastIndexOf(line, '"')
                            } else if (_.lastIndexOf(line, "'") > -1) {
                                var indexEnd = _.lastIndexOf(line, "'")
                            }
                            var indexStart = line.indexOf('("')
                            if (indexStart == -1) { indexStart = line.indexOf("('")}
                            var resultStr = line.slice(indexStart+2, indexEnd)
                            var stringToTable = index + ". \t" + dirName + " \t" + typePL + " \t" + typeCode + " \t " + resultStr + '\n'
                            var stringToTableWithoutIndex = dirName + " \t" + typePL + " \t" + typeCode + " \t " + resultStr + '\n'
                            if (stringToTable.indexOf('", "') > -1) {
                                stringToTable = stringToTable.replace('", "', "")
                            }
                        }

                        tableString.push({
                            withIndex: stringToTable,
                            withoutIndex: stringToTableWithoutIndex
                        })
                    }
                }

                tableString = _.uniq(tableString, 'withoutIndex')

                _.each(tableString, function(el) {
                    finnalyStr += el.withIndex
                })

                var outputFile = typeENG + " " + fileNameCut + '-notyfications'
                
                if (!_.isEmpty(tableString)) {
                    indexFiles++
                    fs.writeFile("./" + indexFiles + outputFile + ".txt", finnalyStr, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                }
            }
        });   

}
searchNotyfications('error', 'E', 'Błąd');