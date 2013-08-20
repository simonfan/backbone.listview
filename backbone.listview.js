define(['backbone'], function(Backbone) {

	var ListView = Backbone.ListView = Backbone.View.extend({
		initialize: function(options) {
			/**
			 * Options:
			 *	- el: html list
			 *	- collection
			 *	- itemData: function that intercepts the model rendering
			 *	- itemTemplate: template function used to render the book thumbnail.
			 *	- itemSelector: function that returns a selector used to find a specific item.
			 */

			_.bindAll(this, 'add','reset','remove','moment');

			this.itemData = options.itemData || this.itemData;
			this.itemTemplate = options.itemTemplate || this.itemTemplate;
			this.itemSelector = options.itemSelector || this.itemSelector;

			// force moments to be an object
			var moments = options.moments || {};
			this.moments = _.defaults(moments, this.moments);

			// listen to events on the collection
			this.listenTo(this.collection, 'add', this.add)
				.listenTo(this.collection, 'reset', this.reset)
				.listenTo(this.collection, 'remove', this.remove);

			// start things up.
			this.reset(this.collection, this.collection.models);
		},

		moment: function(name, args) {
			var moment = this.moments[ name ];

			return typeof moment === 'function' ? $.when( moment.apply(this, args) ) : $.when( true );
		},

		moments: {
			beforeAdd: function($el, model) { $el.css('opacity', 0); },
			afterAdd: function($el, model) { return $el.animate({ opacity: 1 }); },
			beforeRemove: function($el, model) { return $el.animate({ opacity: 0 }); },
		//	afterRemove: function(model) {},
		//	beforeReset: function($el, collection) {},
		//	afterReset: function($el, collection) {},
		},


		/**
		 * When models are added on the collection, 
		 * add them here in the list.
		 */
		add: function(model) {
				// get the data for the template rendering
				// if there is an itemData function set, use it. Otherwise just use the model's attributes.
			var itemData = (typeof this.itemData === 'function') ? this.itemData(model) : model.attributes,
				// render thumbnail
				$thumb = $( this.itemTemplate(itemData) ),
				_this = this;

			this.moment('beforeAdd', [$thumb, model])
				.then(function() {
					// append
					$thumb.appendTo(_this.$el);

					// run after
					_this.moment('afterAdd', [$thumb, model]);
				});
		},

		// handles reset events on the collection
		reset: function(collection, models) {

			var _this = this;

			this.moment('beforeReset', [this.$el, collection])
				.then(function() {
					// remove all items from the list.
					_this.$el.html('');

					// run after
					_this.moment('afterReset');
				});
			
			// add each of the models to the list.
			_.each(collection.models, this.add);
		},

		/**
		 * Handles remove events on the collection
		 */
		remove: function(model) {
			// find the item to be removed
			var selector = this.itemSelector(model),
				$item = this.$el.find(selector),
				_this = this;

			this.moment('beforeRemove', [$item, model])
				.then(function() {
					$item.remove();

					_this.moment('afterRemove', [model]);
				});
		},

		/**
		 * method returns data to be used in the template.
		 */
		itemData: function(model) {
			return model.attributes;
		},

		/**
		 * The templating function
		 */
		itemTemplate: function(data) {
			return '<li id="'+ data.id +'"> Item id: '+ data.id +'</li>';
		},

		/**
		 * method returns a selector used to find the html representation of a given model.
		 * within the $el of this list view.
		 */
		itemSelector: function(model) {
			return '#' + model.id;
		},
	});

	return ListView;
});