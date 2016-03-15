var i = 0;
var filterDone = function(obj) {
  if ('done' in obj && obj.done === 'checked' ) {
    return true;
  } else {
    i++;
    return false;
  }
}

var filterUnDone = function(obj) {
  if ('done' in obj && obj.done === '' ) {
    return true;
  } else {
    i++;
    return false;
  }
}

var Todo = React.createClass({
  // handleTodoCheck: function(){   
   // var id = this.state.id,
       // data = {id:id};
   // $.ajax({
     // url: '/api/modify',
     // dataType: 'json',
     // type: 'POST',
     // data: data,
     // success: function(data){
       // this.setState({data:data});
     // }.bind(this),
     // error: function(xhr, status, err){
       // console.error(this.props.url, status, err.toString());
     // }.bind(this)
   // });
  // },
  getInitialState: function(){
    return { id: '', done: ''};
  },
  toggleChecked: function(e) {
    this.setState({ id: this.props.id, done: e.target.checked});
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
          checked={ this.state.done || this.props.done } 
          onChange={this.toggleChecked}
          onClick={this.handleTodoCheck}
          id={this.props.id } 
        />
        <span className="todoItem" dangerouslySetInnerHTML={this.rawMarkup()} />
        <span className="date">add @ {this.props.date} </span>
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
        var done_todos = data.filter(filterDone);
        var undone_todos = data.filter(filterUnDone);
        this.setState({done_todos : done_todos, undone_todos: undone_todos});
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
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: todos});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {undone_todos: [], done_todos: []};
  },
  componentDidMount: function(){
    this.loadTodosFromServer();
    //setInterval(this.loadTodosFromServer, this.props.pollInterval);
  },
  render: function(){
    return (
      <div className="todoBox">
        <TodoForm onTodoSubmit={this.handleTodoSubmit} />
        <h2>未做的</h2>
        <TodoList class = "todoList undone_todos" data = {this.state.undone_todos} />
        <h2>做完啦</h2>
        <TodoList class = "todoList done_todos"  data = {this.state.done_todos} />       
      </div>
    );
  }
});

var TodoList = React.createClass({
  render: function(){
    var todoNodes = this.props.data.map(function(todo){
      return (
        <Todo key={todo.id} done={todo.done} date={todo.date} id={todo.id}>
          {todo.text}
        </Todo>
      )
    }).reverse();
    return (
      <ul className= {this.props.class}>
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