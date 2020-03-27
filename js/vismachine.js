      optionsIO = {
        autoResize: true,
        groups: {
          ainodes: {
            font: '14px monospace white',
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0e8',
              size: 50,
              color: 'White'
            }
          },
          dbnodes: {
            font: '14px monospace white',
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf1c0',
              size: 50,
              color: 'White'
            }
          },
          security: {
            font: '14px monospace white',
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf028',
              size: 50,
              color: 'red'
            }
          },
          initial: {
            font: '14px monospace white',
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf007',
              size: 50,
              color: 'grey'
            }
          },
        }
      };

    function get_link(from, to) {
        edge_setup = {from: from,
                    to: to,
                    selectionWidth: 0,
                    chosen: false,
                    arrows: {
                        to: {enabled: true,type: 'arrow'}
                      },
                      width: 1,
                      color: "blue"
                }
        return edge_setup
    }

    function draw() {
        hack_text = document.getElementById("hack_descriptor").value.split('\n');

        var nodes = [{id: 0, label: "Initial connect", group: "initial"}]
        var node_regex = /^Port ([0-9]+)/;
        var connections = []
        var connection_regex = /Connect to port ([0-9]+)/
        var thin_connection_regex = /can only connect one user per tick/
        var attack_regex = /Brute force [A-Za-z]+ system ([0-9]+)/i
        var link_regex = /Link ([0-9]+) QPU to port ([0-9]+)/i
        var redirect_regex = /Redirect up to ([0-9]+) QPU from port ([0-9]+) to port ([0-9]+)/i
        var last_port = false
        var show_attack = document.getElementById("showAttack").checked
        var show_links = document.getElementById("showLinks").checked

        // This is all setup code for the nodes and the lines ("edges") between them. After this is done
        // we end with a collection of nodes including an id and a collection of edges which link these nodes.
        for(var i = 0;i < hack_text.length;i++){
            // Notice the single =. I too, like to live dangerously
            if(tag=hack_text[i].match(node_regex)) {
                // Great! We encountered a new port. Let's add the old one if we have one.
                if(last_port) {
                    nodes.push(last_port)
                }
                last_port = {id: tag[1], label: "Port " + tag[1], group: "ainodes"}
            // This matches the "Connect to port" line
            } else if((tag=hack_text[i].match(connection_regex)) && last_port) {
                edge_setup = get_link(last_port.id, tag[1])
                edge_setup.color = "LightGray"
                edge_setup.width = 3
                if(hack_text[i].match(thin_connection_regex)) {
                    edge_setup.width = 1
                    edge_setup.color = "DimGray"
                }
                // This matches the "Connect to port (can only connect one)" line
                connections.push(edge_setup)
            // And this matches the entry point
            } else if(hack_text[i].match("Initial connect")) {
                edge_setup = get_link(0,last_port.id)
                edge_setup.color = "DarkGray"
                connections.push(edge_setup)
            // Nodes with data get a datastore icon
            } else if(hack_text[i].match("Download data")) {
                last_port.group = "dbnodes"
            // And finally, nodes that can attack get an optional red arrow
            } else if(show_attack && (tag = hack_text[i].match(attack_regex))) {
                id = 100 + tag  // Let's start security systems at 1
                exists = nodes.find(  node=> node.id === id )
                if(!exists){
                     nodes.push({id: id, label: "Security " + tag[1], group: "security"})
                }
                edge_setup = get_link(last_port.id,id)
                edge_setup.color = "red"
                connections.push(edge_setup)
            // And finally, finally, put down blue power lines
            } else if(show_links) {
              if (tag = hack_text[i].match(link_regex)) {
                edge_setup = get_link(last_port.id, tag[2])
                edge_setup.title = tag[1] + " QPU growth"
                edge_setup.width = tag[1]
                connections.push(edge_setup)
              } else if(tag = hack_text[i].match(redirect_regex)) {
                edge_setup = get_link(last_port.id, tag[3])
                  // IF the power is taken from another nodes, comment on that
                edge_setup.title = tag[1] + " QPU taken from port " + tag[2]
                edge_setup.width = tag[1]
                connections.push(edge_setup)
              }
            }
        }
        // Don't forget to add the last port!
        if(last_port) {
            nodes.push(last_port)
        }

        var vis_nodes = new vis.DataSet(nodes);
        var vis_edges = new vis.DataSet(connections);

      // create a network
      var container = document.getElementById("mynetwork");
      var data = {
        nodes: vis_nodes,
        edges: vis_edges
      };

      var network = new vis.Network(container, data, optionsIO);
    }
