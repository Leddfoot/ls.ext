/* eslint-env mocha */
import expect from 'expect'
import {buildQuery, translateFieldTerms} from '../../src/backend/utils/searchBuilder'

function advancedQuery (queryWant, boolOperator) {
  boolOperator = boolOperator || 'and'
  return {
    query: {
      bool: {
        must: {
          dis_max: {
            queries: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    function_score: {
                      boost: 1,
                      boost_mode: 'multiply',
                      query: {
                        bool: {
                          must: [
                            {
                              query_string: {
                                query: queryWant,
                                default_operator: boolOperator
                              }
                            }
                          ]
                        }
                      },
                      script_score: {
                        script: {
                          inline: 'deleted',
                          lang: 'painless'
                        }
                      }
                    }
                  },
                  inner_hits: {
                    size: 100,
                    name: 'publications',
                    explain: false
                  }
                }
              },
              {
                bool: {
                  must: {
                    has_child: {
                      type: 'publication',
                      query: {
                        match_all: {}
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  should: [
                    {
                      query_string: {
                        query: queryWant,
                        default_operator: boolOperator
                      }
                    },
                    {
                      function_score: {
                        boost: 1,
                        boost_mode: 'multiply',
                        query: {
                          query_string: {
                            query: queryWant,
                            default_operator: boolOperator
                          }
                        },
                        script_score: {
                          script: {
                            inline: 'deleted',
                            lang: 'painless',
                            params: {
                              now: 'deleted',
                              itemsGain: 0.0,
                              itemsScale: 100,
                              itemsCountLimit: 200,
                              ageGain: 10.0,
                              ageScale: 1000
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        filter: [
          {
            bool: {
              minimum_should_match: 1,
              should: [
                {
                  query_string: {
                    query: queryWant,
                    default_operator: boolOperator
                  }
                },
                {
                  has_child: {
                    type: 'publication',
                    query: {
                      query_string: {
                        query: queryWant,
                        default_operator: boolOperator
                      }
                    }
                  }
                }
              ],
              must: []
            }
          }
        ]
      }
    }
  }
}

describe('searchBuilder', () => {
  describe('building query', () => {
    it('translates field qualificators', () => {
      const translations = {
        'forf': 'author',
        'tittel': 'title',
        'tag': 'subject'
      }
      const tests = [
        [ '', '' ],
        [ '*', '*' ],
        [ 'hei', 'hei' ],
        [ 'abc æøå "123"', 'abc æøå "123"' ],
        [ 'year:1999', 'year:1999' ],
        [ 'forf:hamsun', 'author:hamsun' ],
        [ 'forf:"Knut Hamsun"', 'author:"Knut Hamsun"' ],
        [ 'forf:"Knut Hamsun" sult', 'author:"Knut Hamsun" sult' ],
        [ 'forf:hamsun sult', 'author:hamsun sult' ],
        [ 'tittel:"slaktehus 55" tag:sf', 'title:"slaktehus 55" subject:sf' ],
        [ 'title:"forf: hamsun"', 'title:"forf: hamsun"' ]
      ]
      tests.forEach(test => {
        expect(translateFieldTerms(test[ 0 ], translations)).toEqual(test[ 1 ])
      })
    })

    it('should build simple query', () => {
      const urlQueryString = 'query=some+more+strings'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        {
          dis_max: {
            queries: [
              {
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: {
                    function_score: {
                      boost: 1,
                      boost_mode: 'multiply',
                      query: {
                        bool: {
                          must: [
                            {
                              dis_max: {
                                queries: [
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          agents: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          author: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          country: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          desc: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          ean: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          format: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          inst: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          isbn: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          ismn: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          language: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          mainTitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'some more',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'mainTitle.raw': {
                                            query: 'more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 5
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          subtitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          'subtitle.raw': {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          mt: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'some more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'some more',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match_phrase: {
                                          partTitle: {
                                            query: 'more strings',
                                            slop: 3
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          publishedBy: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          recordId: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          series: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 1
                                    }
                                  },
                                  {
                                    constant_score: {
                                      filter: {
                                        match: {
                                          title: {
                                            query: 'some more strings',
                                            minimum_should_match: '70%'
                                          }
                                        }
                                      },
                                      boost: 0.1
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      },
                      script_score: {
                        script: {
                          inline: 'deleted',
                          lang: 'painless'
                        }
                      }
                    }
                  },
                  inner_hits: {
                    size: 100,
                    name: 'publications',
                    explain: false
                  }
                }
              },
              {
                bool: {
                  must: {
                    has_child: {
                      type: 'publication',
                      query: {
                        match_all: {}
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  should: [
                    {
                      dis_max: {
                        queries: [
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  agents: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  author: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  bio: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  compType: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  country: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  desc: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 0.1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  genre: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  inst: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  language: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  litform: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  mainTitle: {
                                    query: 'some more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  mainTitle: {
                                    query: 'some more',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  mainTitle: {
                                    query: 'more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  'mainTitle.raw': {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subtitle: {
                                    query: 'some more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subtitle: {
                                    query: 'some more',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subtitle: {
                                    query: 'more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  'subtitle.raw': {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  partTitle: {
                                    query: 'some more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  partTitle: {
                                    query: 'some more',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  partTitle: {
                                    query: 'more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 1
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match: {
                                  series: {
                                    query: 'some more strings',
                                    minimum_should_match: '70%'
                                  }
                                }
                              },
                              boost: 2
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subject: {
                                    query: 'some more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 0.5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subject: {
                                    query: 'some more',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 0.5
                            }
                          },
                          {
                            constant_score: {
                              filter: {
                                match_phrase: {
                                  subject: {
                                    query: 'more strings',
                                    slop: 3
                                  }
                                }
                              },
                              boost: 0.5
                            }
                          }
                        ]
                      }
                    },
                    {
                      function_score: {
                        boost: 1,
                        boost_mode: 'multiply',
                        query: {
                          dis_max: {
                            queries: [
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      agents: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      author: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      bio: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      compType: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      country: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      desc: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 0.1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      genre: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      inst: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      language: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      litform: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      mainTitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      'mainTitle.raw': {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subtitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      'subtitle.raw': {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      partTitle: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 1
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match: {
                                      series: {
                                        query: 'some more strings',
                                        minimum_should_match: '70%'
                                      }
                                    }
                                  },
                                  boost: 2
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'some more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'some more',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              },
                              {
                                constant_score: {
                                  filter: {
                                    match_phrase: {
                                      subject: {
                                        query: 'more strings',
                                        slop: 3
                                      }
                                    }
                                  },
                                  boost: 0.5
                                }
                              }
                            ]
                          }
                        },
                        script_score: {
                          script: {
                            inline: 'deleted',
                            lang: 'painless',
                            params: {
                              now: 'deleted',
                              itemsGain: 0.0,
                              itemsScale: 100,
                              itemsCountLimit: 200,
                              ageGain: 10.0,
                              ageScale: 1000.0
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      )
    })

    it('should build advanced query', () => {
      const urlQueryString = 'query=author%3A+Hamsun'
      const queryWant = 'author: Hamsun'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.inline = 'deleted'
      expect(q).toEqual(
        advancedQuery(queryWant, 'and').query.bool.must)
    })

    it('should build an isbn field query from an isbn query string', () => {
      const urlQueryString = 'query=82-05-30003-8'
      const q = buildQuery(urlQueryString).query.bool.must
      q.dis_max.queries[ 0 ].has_child.query.function_score.script_score.script.inline = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.params.now = 'deleted'
      q.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.script_score.script.inline = 'deleted'
      const expected = advancedQuery('isbn:82-05-30003-8', 'and').query.bool.must
      expected.dis_max.queries[ 1 ].bool.should[ 0 ] = {}
      expected.dis_max.queries[ 1 ].bool.should[ 1 ].function_score.query = {}

      expect(q).toEqual(
        expected
      )
    })
  })

  describe('aggregations', () => {
    const urlQueryString = 'excludeUnavailable&filter=audience_juvenile&filter=branch_flam&filter=branch_fmaj&filter=branch_ftor&query=fiske&yearFrom=1980&yearTo=1990'
    it('should include activated filters in aggregations, excluding filters of the given aggregation', () => {
      const a = buildQuery(urlQueryString).aggs.facets.aggs.facets.aggs.audiences
      expect(a.filter.bool.must).toInclude(
        {
          has_child: {
            type: 'publication',
            query: {
              terms: {
                availableBranches: [
                  'flam',
                  'fmaj',
                  'ftor'
                ]
              }
            }
          }
        }
      )
      expect(a.filter.bool.must).toInclude(
        {
          has_child: {
            type: 'publication',
            query: {
              range: {
                publicationYear: {
                  gte: 1980,
                  lte: 1990
                }
              }
            }
          }
        }
      )
      expect(a.filter.bool.must).toNotInclude(
        {
          terms: {
            audiences: [
              'http://data.deichman.no/audience#juvenile'
            ]
          }
        }
      )

      const b = buildQuery(urlQueryString).aggs.facets.aggs.facets.aggs.fictionNonfiction
      expect(b.filter.bool.must).toInclude(
        {
          terms: {
            audiences: [
              'http://data.deichman.no/audience#juvenile'
            ]
          }
        }
      )
    })
  })
})
