var jvm = jvm || {};
jvm.main = (function(w, d, $){

  var BUTTONS = { // optimization: let our view access the DOM as little as possible
    context:{selector:'#blogs-list', $node:null},
    edit:{selector:'.edit-blog', $node:null},
    delete:{selector:'.delete-blog', $node:null},
    update:{selector:'.update-blog', $node:null},
    cancel:{selector:'.cancel', $node:null}
  };

  var Blog = Backbone.Model.extend({ // start with a single model, or consider more than one model if you want to define a collection later
    defaults:{
      author:'',
      title:'',
      url:''
    }
  });

  var Blogs = Backbone.Collection.extend({});

  var blogs = new Blogs(); // user blog entries storage

  var listeners = {
      setListener:function(options){
        options.$node.on(options.event, options.data, options.listener);
      },
      createBlog:function createBlog(e){
        var blog = new Blog({ // model
          author:$('.author-input').val(),
          title:$('.title-input').val(),
          url:$('.url-input').val()
        });

        $('.form-control').val(''); // clear the input fields to allow the visitor to begin a clean entry

        blogs.add(blog); // views do not have data listeners, models have data listeners

    }, // End createBlog
    triggerCreateBlog:function(e){
      if(e.which === 13){
        $('.add-blog').triggerHandler('click');
      }
    }

  }; // End listeners


  var BlogView = Backbone.View.extend({
    model:new Blog(),
    tagName:'tr',
    initialize:function(){
      this.template = _.template($('#blog-list-template').html()); // use underscore.js template having embedded variables
    },
    events:{
      'click .edit-blog':'edit',
      'click .update-blog':'update',
      'click .cancel':'cancel',
      'click .delete-blog':'delete'
    },
    causeFocus:function(paramSelector){ // Accesibility, friendliness
      this.$(paramSelector).focus();
    },
    accessButtons:function(){
      !!BUTTONS.context.$node == false ? BUTTONS.context.$node = $(BUTTONS.context.selector) : ''; // optimization, do nothing if exist
      BUTTONS.edit.$node = $(BUTTONS.edit.selector, BUTTONS.context.$node); // in template... So, must reaccess for each update
      BUTTONS.delete.$node = $(BUTTONS.delete.selector, BUTTONS.context.$node); // in template... So, must reaccess for each update
      BUTTONS.update.$node = $(BUTTONS.update.selector, this.$el); // this.$el is context, because we want row button
      BUTTONS.cancel.$node = $(BUTTONS.cancel.selector, this.$el); // this.$el is context, because we want row button
    },
    buildNodes:function(options){
      var nodes = [];
      for(var i = 0, len = options.quanity; i < len; i++){
        nodes[i] = d.createElement(options.nodeName);
        nodes[i].setAttribute('class', options.class);
      }
      return nodes;
    },
    edit:function(){
      this.accessButtons();
      BUTTONS.edit.$node.hide(); // hide all edit buttons
      BUTTONS.delete.$node.hide(); // hide all delete buttons
      BUTTONS.update.$node.show(); // show update for this model
      BUTTONS.cancel.$node.show(); // show cancel for this model
      // store visitor values
      var author = this.$('.author').html(); // entry in our template
      var title = this.$('.title').html(); // entry in our template
      var url = this.$('.url').html(); // entry in our template
      // change html to inputs and populate with visitor values
      var nodes = ( this.buildNodes({quanity:3, nodeName:'input', 'class':'form-control'}) );

      for(var i = 0, len = nodes.length; i < len; i++){
        switch(i){
          case 0:
            $(nodes[i]).addClass('author-update').attr('value', author);
            this.$('.author').replaceWith(nodes[i]);
            break;            
          case 1:
            $(nodes[i]).addClass('title-update').attr('value', title);
            this.$('.title').replaceWith(nodes[i]);
            break;                        
          case 2:
            $(nodes[i]).addClass('url-update').attr('value', url);
            this.$('.url').replaceWith(nodes[i]);
            break;
          default:
            throw new Error('Exception: switch in edit discovered undefined index:\t', i);                        
        }
      } // End for

      this.causeFocus('input.author-update');
    },
    update:function(){
      BUTTONS.edit.$node.show();
      BUTTONS.delete.$node.show();
      BUTTONS.update.$node.hide();
      BUTTONS.cancel.$node.hide();

      // get revised visitor values and update model
      this.model.set('author', this.$('.author-update').val()); // triggers our model.change listener
      this.model.set('title', this.$('.title-update').val()); // triggers our model.change listener
      this.model.set('url', this.$('.url-update').val()); // tiggers our model.change listener    
    },
    cancel:function(){
      blogsView.render(); // use our BlogsView Instance to rerender relative to model state
    },
    delete:function(){
      // we need a model delete listener
      this.model.destroy();
    },  
    render:function(){ // this.model contains the variable names defined in our template
      this.$el.html(this.template(this.model.toJSON())); // view render pass template to this.$el.html()
      return this;
    }
  });

  // backbone view for all blogs, models
  var BlogsView = Backbone.View.extend({
    model:blogs,
    el:$('.blogs-list'),
    initialize:function(){
      var self = this; // scoping
      this.model.on('add', this.render, this); // create model listeners wihtin views, within the initialize phase
      // define a model change listener
      this.model.on('change', function(){
        // wait for DOM re-render
        setTimeout(function(){
          self.render(); // call our render method which populates view relative to model
        }, 333);
      });
      // define a model destroy listener
      this.model.on('remove', this.render, this);    
      this.causeFocus('input.author-input');
    },
    causeFocus:function(paramSelector){
      $(paramSelector).focus();
    },  
    render:function(){
      var self = this; // scoping
      this.$el.html(''); // clear previous blog list
      _.each(this.model.toArray(), function(blog){
          self.$el.append( (new BlogView({model:blog})).render().$el );
      });
      this.causeFocus('.author-input');
      return this;
    }
  });

  var blogsView = new BlogsView();

  var interval = w.setInterval(function(){ // optimization: wait for DOM, don't need jQuery for this
    if( d.getElementsByTagName('div').length > 0 ){
      w.clearInterval(interval);
      listeners.setListener({$node:$('.add-blog'), event:'click', data:{}, listener:listeners.createBlog});
      listeners.setListener({$node:$('#container'), event:'keyup', data:{}, listener:listeners.triggerCreateBlog});
    }
  }, 333);

})(window, document, jQuery);