// 搭建网站服务器，实现客户端与服务端的通信
// 连接数据库，创建用户集合，向集合中插入文档
// 当用户访问 /list 时，将所有用户信息查询出来
// 将用户信息和表格 HTML 进行拼接并将拼接结果响应回客户端
// 当用户访问 /add 时，呈现表单页面，并实现添加用户信息功能
// 当用户访问 /modify 时，呈现修改页面，并实现修改用户信息功能
// 当用户访问 /delete 时，实现用户删除功能

const http = require('http');
const mongoose = require('mongoose');
const url = require('url');
const querystring = require('querystring');

mongoose.connect('mongodb://localhost/case', { useUnifiedTopology: true, useNewUrlParser: true })
	.then(() => {console.log('数据库连接成功')})
	.catch((err) => {console.log(err, '数据库连接失败')});

// 创建用户集合规则
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 20
	},
	age: {
		type: Number,
		min: 18,
		max: 80
	},
	password: String,
	email: String,
	hobbies: [String]
});

// 根据规则创建集合
const User = mongoose.model('User', userSchema);

const app = http.createServer();

app.on('request', async (req, res) => {
	const method = req.method.toLowerCase();
	const { pathname, query } = url.parse(req.url, true);
	res.writeHead(200, {
		'content-type': 'text/html;charset=utf8'
	});
	if (method == 'get') {
		if (pathname == '/list') {
			// 查询用户信息
			let users = await User.find();
			
			let list = `<!DOCTYPE html>
				<html>
				<head>
					<title>list</title>
					<style type="text/css">
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						#contain {
							width: 100%;
							padding: 10px 50px;
						}
						.blueBtn {
							background-color: rgb(44, 117, 182);
							outline: none;
							border: 0px;
							color: white;
							width: 80px;
							height: 35px;
							line-height: 35px;
							font-size: 15px;
							display: block;
							text-align: center;
							border-radius: 10px;
							margin-bottom: 10px;
							text-decoration: none;
						}
						#table {
							width: 100%;
						}
						#table th {
							color: #222;
							padding: 3px;
							background-color: rgb(246, 249, 246);
						}
						#table td {
							text-align: center;
							padding: 3px;
						}
						#table tbody td a:nth-child(1) {
							background-color: rgb(226, 80, 63);
							outline: none;
							border: 0px;
							color: white;
							width: 40px;
							height: 25px;
							line-height: 25px;
							font-size: 12px;
							border-radius: 6px;
							display: inline-block;
							text-decoration: none;
						}
						#table tbody td a:nth-child(2) {
							background-color: rgb(92, 147, 98);
							outline: none;
							border: 0px;
							color: white;
							width: 40px;
							height: 25px;
							line-height: 25px;
							font-size: 12px;
							border-radius: 6px;
							display: inline-block;
							text-decoration: none;
						}
						#table tbody tr:nth-child(even) {
							background-color: rgb(246, 249, 246);
						}
					</style>
				</head>
				<body>
					<div id="contain">
						<div id="box">
							<div class="blueDiv">
								<a class="blueBtn" href="/add">添加用户</a>
							</div>
							<table id="table" border="1px" cellspacing="0">
								<thead>
									<tr>
										<th>用户名</th>
										<th>年龄</th>
										<th>爱好</th>
										<th>邮箱</th>
										<th>操作</th>
									</tr>
								</thead>
								<tbody>`;

			users.forEach((item) => {
				list += `<tr>
									<td>${item.name}</td>
									<td>${item.age}</td>
									<td>${item.hobbies.join(' ')}</td>
									<td>${item.email}</td>
									<td>
										<a href="/remove?id=${item._id}" class="redBtn">删除</a>
										<a href="/update?id=${item._id}" class="greenBtn">修改</a>
									</td>
								</tr>`;
			});

			list += `</tbody>
				</table>
				</div>
				</div>
				</body>
				</html>`;

			res.end(list);
		} else if (pathname == '/add') {
			let add = `<!DOCTYPE html>
				<html>
				<head>
					<title>add</title>
					<style type="text/css">
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						#contain {
							width: 100%;
							padding: 10px 50px;
						}
						.addBtn {
							background-color: rgb(44, 117, 182);
							outline: none;
							border: 0px;
							color: white;
							width: 80px;
							height: 35px;
							line-height: 35px;
							font-size: 15px;
							border-radius: 6px;
							margin-top: 10px;
						}
						.boldTitle {
							font-size: 18px;
							font-weight: bold;
							margin: 10px;
						}
						label input {
							width: 100%;
							height: 40px;
							border: 1px solid #ccc;
							padding: 11px 10px;
							font-size: 18px;
							border-radius: 10px;
							outline: none;
						}
						label input:focus {
							outline: 1px solid #222; 
						}
						#hobby input {
							margin: 10px
						}
					</style>
				</head>
				<body>
					<div id="contain">
						<div id="box">
							<div class="users">
								<h2>添加用户</h2>
							</div>
							<form method="post" action="/add">
								<label>
									<p class="boldTitle">用户名</p>
									<input type="text" name="name" placeholder="请填写用户名">
								</label>
								<label>
									<p class="boldTitle">密码</p>
									<input type="password" name="password" placeholder="请输入密码">
								</label>
								<label>
									<p class="boldTitle">年龄</p>
									<input type="number" name="age" placeholder="请填写年龄">
								</label>
								<label>
									<p class="boldTitle">邮箱</p>
									<input type="email" name="email" placeholder="请填写邮箱">
								</label>
								<div id="hobby">
									<p class="boldTitle">请选择爱好</p>
									<input type="checkbox" name="hobbies" value="足球">足球
									<input type="checkbox" name="hobbies" value="篮球">篮球
									<input type="checkbox" name="hobbies" value="橄榄球">橄榄球
									<input type="checkbox" name="hobbies" value="敲代码">敲代码
									<input type="checkbox" name="hobbies" value="抽烟">抽烟
									<input type="checkbox" name="hobbies" value="喝酒">喝酒
									<input type="checkbox" name="hobbies" value="烫头">烫头
								</div>
								<input type="submit" class="addBtn" value="添加用户" />
							</form>
						</div>
					</div>
				</body>
				</html>`;
			res.end(add);
		} else if (pathname == '/update') {
			let user = await User.findOne({_id: query.id});
			let hobbiesArr = ['足球', '篮球', '橄榄球', '代码', '抽烟', '喝酒', '烫头'];

			let update = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>add</title>
					<style type="text/css">
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						#contain {
							width: 100%;
							padding: 10px 50px;
						}
						.addBtn {
							background-color: rgb(44, 117, 182);
							outline: none;
							border: 0px;
							color: white;
							width: 80px;
							height: 35px;
							line-height: 35px;
							font-size: 15px;
							border-radius: 6px;
							margin-top: 10px;
						}
						.boldTitle {
							font-size: 18px;
							font-weight: bold;
							margin: 10px;
						}
						label input {
							width: 100%;
							height: 40px;
							border: 1px solid #ccc;
							padding: 11px 10px;
							font-size: 18px;
							border-radius: 10px;
							outline: none;
						}
						label input:focus {
							outline: 1px solid #222; 
						}
						#hobby input {
							margin: 10px
						}
					</style>
				</head>
				<body>
					<div id="contain">
						<div id="box">
							<div class="users">
								<h2>修改用户</h2>
							</div>
							<form method="post" action="/update?id=${user._id}">
								<label>
									<p class="boldTitle">用户名</p>
									<input type="text" value="${user.name}" name="name" placeholder="请填写用户名">
								</label>
								<label>
									<p class="boldTitle">密码</p>
									<input type="password" value="${user.password}" name="password" placeholder="请输入密码">
								</label>
								<label>
									<p class="boldTitle">年龄</p>
									<input type="number" value="${user.age}" name="age" placeholder="请填写年龄">
								</label>
								<label>
									<p class="boldTitle">邮箱</p>
									<input type="email" value="${user.email}" name="email" placeholder="请填写邮箱">
								</label>
								<div id="hobby">
									<p class="boldTitle">请选择爱好</p>
			`;
			hobbiesArr.forEach(item => {
				let isHobby = user.hobbies.includes(item);
				if (isHobby) {
					update += `<input type="checkbox" name="hobbies" checked value="${item}">${item}`;
				} else {
					update += `<input type="checkbox" name="hobbies" value="${item}">${item}`;
				}
			});
			update += `
				</div>
								<input type="submit" class="addBtn" value="修改用户" />
							</form>
						</div>
					</div>
				</body>
				</html>
			`;
			res.end(update);
		} else if (pathname == '/remove') {
			await User.findOneAndDelete({_id: query.id});
			res.writeHead(301, {
				Location: '/list'
			});
			res.end();
		}
	} else if (method == 'post') {
		if (pathname == '/add') {
			// 接收用户提交的信息
			let formData = '';
			req.on('data', params => {
				formData += params;
			});

			req.on('end', async () => {
				let user = querystring.parse(formData);
				// 将信息添加到数据库中
				await User.create(user);
				// 301 代表重定向，Location为跳转到的位置。
				res.writeHead(301, {
					Location: '/list'
				});
				res.end();
			});
		} else if (pathname == '/update') {
			// 接收用户提交的信息
			let formData = '';
			req.on('data', params => {
				formData += params;
			});

			req.on('end', async () => {
				let user = querystring.parse(formData);
				console.log(query);
				// 将信息添加到数据库中
				await User.updateOne({_id: query.id}, user);
				// 301 代表重定向，Location为跳转到的位置。
				res.writeHead(301, {
					Location: '/list'
				});
				res.end();
			});
		}
	}

});

app.listen(3000);