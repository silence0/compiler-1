let keywords = [];  // 关键字

let operators = [];  // 操作符

let separators = [];  // 分隔符

let sourceCode = "";  // 源代码

let encodeDefines = [];  // 编码定义 type:" "; key: ; value: ;

let resultEncodes = [];  // 编码结果

let msg = "";

console.log('runing');

function autofill() {

    let keywords2 = "main\n if\n  int\n  char\n  while";  // 关键字

    let operators2 = "=\n  +\n  -\n  *\n  =\n  /\n  <\n  <=\n  >\n  >=\n  ==\n  !=";  // 操作符

    let separators2 = ";\n  {\n  }\n  (\n  )";  // 分隔符

    let sourceCode2 = `
        main(){
            int	a;
            int	b;
            a = 1;
            b = 2;
            if(a==1){
                b = b + 1;
            }
            while(a < b){
                b = b - 1;
            }	
        }
    `;  // 源代码

    readKeywords(keywords2);

    readOperators(operators2);

    readSeparators(separators2);

    readSrc(sourceCode2);

    geneencodeDefines();// 生成编码定义
    geneEncodeTable();  // 生成定义表格

}

//读取输入文件
function handleFile(files, sign){
	if(files.length<=0)
        return;

    let reader = new FileReader();

    reader.onload = function(){
    	switch(sign){
    		case 0:
    		    console.log(reader.result);
    			readKeywords(reader.result);

    			break;
    		case 1:
    			readOperators(reader.result);
    			break;
    		case 2:
    			readSeparators(reader.result);
    			break; 
    		case 3:
    			readSrc(reader.result);
    	}
    	geneencodeDefines();// 生成编码定义
    	geneEncodeTable();  // 生成定义表格
    }

    reader.readAsText(files[0]);
}

function trim(str){  // 去除空格和回车
	if(!str){
		return "";
	}
	return str.replace(/\n+|\s+|\r+/g, "");
}

function readSrc(text){  // 读取源代码
	console.log(text);
	srcElement = document.getElementById('src');
	sourceCode = text;
	srcElement.value = text;

}

function readKeywords(text){  // 读取关键字
	keywords = [];
	tempKeywords = text.split('\n');

	for (var i = tempKeywords.length - 1; i >= 0; i--) {  // 去除空格和回车
		tempKeyword = trim(tempKeywords[i]);
		if(tempKeyword.length > 0){
			keywords.push(tempKeyword);
		}
	}
}

function readOperators(text){  // 读取操作符
	operators = [];
	tempOperators = text.split('\n');

	for (var i = tempOperators.length - 1; i >= 0; i--) {  // 去除空格和回车
		tempOperator = trim(tempOperators[i]);
		if(tempOperator.length > 0){
			operators.push(tempOperator);
		}
	}
}

function readSeparators(text){  // 读取界符
	separators = [];
	tempSeparators = text.split('\n');

	for (var i = tempSeparators.length - 1; i >= 0; i--) {  // 去除空格和回车
		tempSeparator = trim(tempSeparators[i]);
		if(tempSeparator.length > 0){
			separators.push(tempSeparator);
		}
	}
}

function geneencodeDefines(){  // 生成编码定义
	index = 1;
	encodeDefines = [];
	for (var i = keywords.length - 1; i >= 0; i--) {
		encodeDefines.push({'type': '保留字', 'key': keywords[i], 'value': index++});
	}

	for (var i = operators.length - 1; i >= 0; i--) {
		encodeDefines.push({'type': '运算符', 'key':operators[i], 'value': index++});
	}

	for (var i = separators.length - 1; i >= 0; i--) {
		encodeDefines.push({'type': '分隔符', 'key': separators[i], 'value': index++}); 
	}

	encodeDefines.push({'type': '标识符', 'key': 'sy_identifier', 'value': index++});
	encodeDefines.push({'type': '常数', 'key': 'sy_constant', 'value': index++});

	console.log('encodeDefines:', encodeDefines);
}

function geneEncodeTable(){  // 生成定义表格
	encodeTBody = '';
	defineElement = document.getElementById('define-container');

	for (var i = encodeDefines.length - 1; i >= 0; i--) {
		encodeTBody += `<tr>
		<td>${encodeDefines[i]['type']}</td>
		<td>${encodeDefines[i]['key']}</td>
		<td>${encodeDefines[i]['value']}</td>
		</tr>`
	}

	defineElement.innerHTML = encodeTBody;
}

function analyse(){  // 开始分析
	if(!checkData()){
		return;
	}
	sourceCode = document.getElementById('src').value; //获取源程序
	msgElement = document.getElementById('msg'); //获取过程信息的表格对象
	msgElement.value = ''; //清空过程信息表格
	resultElement = document.getElementById('result-container'); //获取结果信息表格对象
	resultElement.innerHTML = ''; //清空结果信息表格
	resultEncodes = []; //
	msg = ''; //

	let row = 0;
	let column = 0;
	let curWord = '';  // 当前单词
	let curChar = '';  // 当前字符

	let lines = sourceCode.split('\n');
	
	for(let line of lines){
		row += 1;
		column = 0;
		curWord = '';
		curChar = line[column];
		console.log(line + "\tlength:" + line.length);
		while(column < line.length){
			if(isAlpha(curChar)){  // 匹配字符
				do{
					curWord += curChar;
					column += 1;
					curChar = line[column];					
				}while(isAlpha(curChar) || isNum(curChar));

				if(iskeyWords(curWord)){
					msg += `row: ${row},col: ${column}  : 匹配到关键字--${curWord}\n`;
					value = getTypeEncode(2, curWord);  //获取单词的种别编码
					resultEncodes.push({'key':curWord, 'value': value, 'internal': '-'});
					curWord = '';
				}else{
					msg += `row: ${row},col: ${column}  : 匹配到标识符--${curWord}\n`;
					value = getTypeEncode(0);
					resultEncodes.push({'key':curWord, 'value': value, 'internal': curWord});
					curWord = '';
				}

			}else if(isNum(curChar)){  // 数字
				do{
					curWord += curChar;
					column += 1;
					curChar = line[column];
				}while(isNum(curChar) || curChar == '.');
				if(isConstant(curWord)){
					msg += `row: ${row},col: ${column}  : 匹配到数字--${curWord}\n`;
					value = getTypeEncode(1); //获取常数的种别编码
					resultEncodes.push({'key':curWord, 'value': value, 'internal': curWord})
					curWord = '';
				}else{
					msg += `error in row: ${row},col: ${column}, 不正确的数字格式\n`;
					alert('源代码存在词法错误');
					break;
				}

			}else if(!trim(curChar)){  // 空格
				do{
					column += 1;
					curChar = line[column]
				}while(!trim(curChar) && curChar);
				curWord = ''
			}else{  // 其他符号
				// do{
				// 	curWord += curChar;
				// 	column += 1;
				// 	curChar = line[column];
				// }while(!isNum(curChar) && !isAlpha(curChar) && curChar);

                curWord += curChar;
                column += 1;
                curChar = line[column];
                console.log('其他符号',curWord,'/tcolumn:',column);

                if(isSeparator(curWord)){
                    msg += `row: ${row},col: ${column}  : 匹配到分隔符--${curWord}\n`;
                    value = getTypeEncode(2, curWord); //获取分隔符的种别编码
                    resultEncodes.push({'key':curWord, 'value': value, 'internal': '-'});
                    curWord = '';
                }else {
                    if(isOperator(curWord)) {
                        curWord2 = curWord + curChar;
                        if(isOperator(curWord2)) {
                            column += 1;
                            curChar = line[column];
                            msg += `row: ${row},col: ${column}  : 匹配到操作符--${curWord2}\n`;
                            value = getTypeEncode(2, curWord2); //获取操作符的种别编码
                            resultEncodes.push({'key': curWord2, 'value': value, 'internal': '-'});
                            curWord = '';
                        }else if(curWord == '#~'){
                            msg += '匹配到#~, ---词法分析结束----\n';
                            break;
                        }else {
                            msg += `row: ${row},col: ${column}  : 匹配到操作符--${curWord}\n`;
                            value = getTypeEncode(2, curWord); //获取操作符的种别编码
                            resultEncodes.push({'key': curWord, 'value': value, 'internal': '-'});
                            curWord = '';
                        }
                    }else{
                        msg += `error in row: ${row},col: ${column}, 不合法的符号:${curWord}\n`;
                        alert('源代码存在词法错误');
                        geneMsg();
                        return;
                    }
                }

			}
		}
	}
	geneMsg();
	geneResultTable();
}

function geneResultTable(){
	resultElement = document.getElementById('result-container');
	resultElement.innerHTML = '';

	resultTBody = '';


	for(let resultEncode of resultEncodes){
		resultTBody += `<tr>
		<td>${resultEncode['key']}</td>
		<td>${resultEncode['value']}</td>
		<td>${resultEncode['internal']}</td>
		</tr>`
	}
	resultElement.innerHTML = resultTBody;
}

function geneMsg(){
	console.log(msg);
	msgElement = document.getElementById('msg');
	msgElement.value = '';
	msgElement.value = msg;
}

function getTypeEncode(sign, token){  // 获取种别编码 sign: 0-标识符, 1-常数, 2-其他已存在的编码(保留字等)
	switch(sign){
		case 0:
			for(let encodeDefine of encodeDefines){
				if(encodeDefine['key'] == 'sy_identifier'){
					return encodeDefine['value'];
				}
			}
			break;
		case 1:
			for(let encodeDefine of encodeDefines){
				if(encodeDefine['key'] == 'sy_constant'){
					return encodeDefine['value'];
				}
			}
			break;
		case 2:
			for(let encodeDefine of encodeDefines){
				if(encodeDefine['key'] == token){
					return encodeDefine['value'];
				}
			}
			break;
	}
}

function isAlpha(word){  // 判断是否是单个字母或下划线
	const regex = /^[A-Za-z_]$/;
	return regex.test(word);
}

function isNum(word){  // 判断是否是数字
	const regex = /^[0-9]$/;
	return regex.test(word);
}

function iskeyWords(str){  // 是否是关键字
	for(let keyword of keywords){
		if(str == keyword){
			return true;
		}
	}
	return false;
}

function isConstant(str){  // 是否是合法数字
	const regex = /^(\-)?[0-9]+(\.[0-9]+)?$/;
	return regex.test(str);
}

function isOperator(str){  // 是否是操作符
	for(let operator of operators){
		if(str == operator){
			return true;
		}
	}
	return false;
}

function isSeparator(str){  // 是否是分隔符
	for(let separator of separators){
		console.log(typeof separator)
		if(str === separator){
			return true;
		}
	}
	return false;
}

function checkData(){  // 检查各项数据是否完整
	if(sourceCode.length == 0){
		alert('源程序为空, 请加载源代码');
		return false;
	}

	count = 0;
	if(encodeDefines.length == 0){
		console.log('保留字为空');
		count++;
	}

	if(encodeDefines.length == 0){
		console.log('保留字为空');
		count++;
	}
	if(encodeDefines.length == 0){
		console.log('保留字为空');
		count++;
	}

	if (count == 3) {
		alert('编码定义表为空, 请至少加载一种编码定义')
		return false;
	}

	return true;
}