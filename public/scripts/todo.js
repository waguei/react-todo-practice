var Todo = React.createClass({
	rawMarkup: function(){
		var rawMarkup = marked(this.props.children.toString(), {sanitize:true});
		return {__html: rawMarkup} ;
	},
	render: function(){
		return (
			<li className="todo">
				<span className="todo" dangerouslySetInnerHTML={this.rawMarkup()} />
			</li>
		);
	}
});

var TodoBox = React.createClass({	
	loadTodosFromServer: function(){
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleTodoSubmit: function(todo){
		var todos = this.state.data;
		todo.id=Date.now();
		var newTodos = todos.concat([todo]);
		this.setState({data: newTodos});
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: todo,
			success: function(data){
				this.setState({data:data});
			}.bind(this),
			error: function(xhr, status, err){
				this.setState({data: todos});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function(){
		return {data: []};
	},
	componentDidMount: function(){
		this.loadTodosFromServer();
		setInterval(this.loadTodosFromServer, this.props.pollInterval);
	},
	render: function(){
		return (
			<div className="todoBox">
				<TodoForm onTodoSubmit={this.handleTodoSubmit}/>
				<TodoList data = {this.state.data}/>				
			</div>
		);
	}
});

var TodoList = React.createClass({
	render: function(){
		var todoNodes = this.props.data.map(function(todo){
			return (
				<Todo key={todo.id}>
					{todo.text}
				</Todo>
			)
		}).reverse();
		return (
			<ul className="todoList">
				{todoNodes}
			</ul>
		)
	}
});


var TodoForm = React.createClass({
	getInitialState: function(){
		return {text:''};
	},
	handleTextChange: function(e){
		this.setState({text:e.target.value})
	},
	handleSubmit: function(e){
		e.preventDefault();
		var text = this.state.text.trim();
		if(!text){
			return;
		}
		this.props.onTodoSubmit({text:text});
		this.setState({text:''});
	},
	render: function(){
		return (
			<form className="totoForm" onSubmit={this.handleSubmit}>
				<input 
					type="text" 
					placeholder="要做什麼呢?"
					onChange={this.handleTextChange}
					value={this.state.text}
					className="todoInput"
					/>
				<input type="submit" value="送出" className="todoSubmit" />
			</form>
		)
	}
})


ReactDOM.render(
	<TodoBox url='/api/todos' pollInterval={2000}/>,
	document.getElementById('content')
)