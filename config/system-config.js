const env = process.env.NODE_ENV || 'development';

const systemConfig = {
    'development': {
        'api_key': 'FVZJegOqhqo7dKD9xwhzLRQfCxHRKucGA4KjMlGl',
        'bookcase': './bookcase/',
        'default_article_id': 'e284533d-e442-4b12-acb5-a89d1ce2038d',
        'max_word_count': 50000
    },
    'test': {
        'api_key': 'FVZJegOqhqo7dKD9xwhzLRQfCxHRKucGA4KjMlGl',
        'bookcase': './bookcase/',
        'default_article_id': '2b9799cb-9968-4111-9221-cf6818279239',
        'max_word_count': 50000
    },
    'production': {
        'api_key': 'FVZJegOqhqo7dKD9xwhzLRQfCxHRKucGA4KjMlGl',
        'bookcase': './bookcase/',
        'default_article_id': 'e284533d-e442-4b12-acb5-a89d1ce2038d',
        'max_word_count': 50000
    }
}

module.exports = systemConfig[env];