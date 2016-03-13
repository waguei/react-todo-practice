var Todo = React.createClass({
  getInitialState: function(){
    return {done:''};
  },
  handleCheckChange: function(e){
    this.setState({done:e.target.checked})
  },
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize:true});
    return {__html: rawMarkup} ;
  },
  render: function(){
    return (
      <li className="todo">
        <input 
          type="checkbox" 
          checked={this.state.done || this.props.done } 
          onChange={this.handleCheckChange}
        />
        <span className="todoItem" dangerouslySetInnerHTML={this.rawMarkup()} />
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
  loadDoneTodosFromServer: function(){
    $.ajax({
      url: '/api/done',
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data2: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTodoSubmit: function(todo){
    var todos = this.state.data;
    todo.id=Date.now();
    todo.done='';
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
  handleTodoCheck: function(todo){
    var todos = this.state.data;
    todo.id=Date.now();
    todo.done='';
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
    return {data: [], data2: []};
  },
  componentDidMount: function(){
    this.loadTodosFromServer();
    this.loadDoneTodosFromServer();
    setInterval(this.loadTodosFromServer, this.props.pollInterval);
    setInterval(this.loadDoneTodosFromServer, this.props.pollInterval);
  },
  render: function(){
    return (
      <div className="todoBox">
        <TodoForm onTodoSubmit={this.handleTodoSubmit}/>
        <h2>未做的</h2>
        <TodoList data = {this.state.data} onTodoCheck={this.handleTodoCheck}/>
        <h2>做完啦</h2>
        <TodoDoneList data = {this.state.data2}/>       
      </div>
    );
  }
});

var TodoList = React.createClass({
  render: function(){
    var todoNodes = this.props.data.map(function(todo){
      return (
        <Todo key={todo.id} done={todo.done}>
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

var TodoDoneList = React.createClass({
  render: function(){
    var todoNodes = this.props.data.map(function(todo){
      return (
        <Todo key={todo.id} done={todo.done}>
          {todo.text}
        </Todo>
      )
    }).reverse();
    return (
      <ul className="todoListDone">
        {todoNodes}
      </ul>
    )
  }
});


var TodoForm = React.createClass({
  getInitialState: function(){
    return {text:'', done:''};
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