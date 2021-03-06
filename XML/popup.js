function spaceDelete(str) {

    return str.replace(/(^\s+|\s+$)/g, '');

}


function start() {

    document.getElementById('textarea_block').style.display = 'none';
    document.getElementById('categories').innerHTML = document.getElementById('text').value;

    (($) => {
        function str_replace(search, replace, subject, count) {
            let j = 0,
                temp = '',
                repl = '',
                fl = 0,
                f = [].concat(search),
                r = [].concat(replace),
                s = subject,
                ra = Object.prototype.toString.call(r) === '[object Array]',
                sa = Object.prototype.toString.call(s) === '[object Array]';
            s = [].concat(s);
            if (count) {
                this.window[count] = 0;
            }
            for (let i = 0, sl = s.length; i < sl; i++) {
                if (s[i] === '') {
                    continue;
                }
                for (j = 0, fl = f.length; j < fl; j++) {
                    temp = s[i] + '';
                    repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                    s[i] = (temp).split(f[j]).join(repl);
                    if (count && s[i] !== temp) {
                        this.window[count] += (temp.length - s[i].length) / f[j].length;
                    }
                }
            }
            return sa ? s : s[0];
        }

        function printResult(text, top) {
            let textArea = $('<textarea />')
                .css({
                    background: '#FFF',
                    width: '100%',
                    height: '100%'
                })
                .text(text),
                div = $('<pre />')

                .appendTo(document.body)
                .append(textArea);
            $('<input type="button" value="CLOSE">')

                .appendTo(div)
                .click(() => div.remove());
        }


        let node = function (name, id, parent) {

            this.name = spaceDelete(name);
            this.id = id;
            this.parent = parent;
            this.children = [];



        };

        let nodes = {};

        let input = document.getElementById('text').value;

        $(input).each(function () {
            let me = $(this),
                id = me.attr('id'),
                parentId = me.attr('parentid') ? me.attr('parentid') : null,
                name = me.text();
            nodes[id] = new node(name, id, parentId);
            console.log(me);
        });

        /*-------------------------------- category massive ------------------------------------*/

        console.log(nodes);
        var catList = [];
        var cat = document.getElementsByTagName('category');

        /*   ctegory massive create  */

        function addToList(ID) {
            var childList = [];


            for (let i = 0; i < cat.length; i++) {

                if (cat[i].getAttribute('parentId') == ID) {

                    childList.push(cat[i].id);
                }
            }

            for (let i = 0; i < childList.length; i++) {

                catList[catList.length - 1].push(childList[i]);
                addToList(childList[i]);
            }
        }

        for (let i = 0; i < cat.length; i++) {

            if (cat[i].getAttribute('parentId') == null) {

                catList.push([cat[i].innerHTML]);
                catList[catList.length - 1].push(cat[i].id);
                addToList(cat[i].id)
            }
        }

        if (document.getElementById('charChange').checked) {
            for (let i = 0; i < catList.length; i++) {
                let charChange = prompt(catList[i][0],catList[i][0] );
                if(charChange == 'break'){
                    break;
                }
                else if(charChange != null){
                    catList[i][0] = charChange;
                }
                
                 
            }
        }



        console.log(catList)
        var characterOut = ''
        for (let i = 0; i < catList.length; i++) {
            characterOut += catList[i][0] + "\n";
        };
        document.getElementById('character').parentNode.style = 'display:block;';
        document.getElementById('character').value = characterOut;



        /*------------------------------------------------- category massive ------------------------------------------*/


        for (let id in nodes) {
            if (nodes.hasOwnProperty(id)) {
                let node = nodes[id],
                    parentId = node.parent;

                if (!nodes.hasOwnProperty(parentId)) {
                    node.parent = null;
                } else {
                    console.log('child added');
                    nodes[parentId].children.push(node);
                    node.parent = nodes[parentId];
                }
            }
        }

        let printNodes = function (node, prefix) {
            prefix = prefix || '';
            let ret = prefix + node.name + "\n";
            prefix += '--';
            for (let i = 0, l = node.children.length; i < l; ++i) {
                ret += printNodes(node.children[i], prefix);
            }

            return ret;
        };
        let nodesText = "";

        for (let id in nodes) {
            if (nodes.hasOwnProperty(id) && nodes[id].parent === null) {
                nodesText += printNodes(nodes[id]) + "\n";
            }
        }

        printResult(nodesText, true);

        let sqlStart = "# LOCK TABLES `pages` WRITE, `languages` WRITE;\n" +
            "LOCK TABLES `pages` WRITE, `languages` AS L WRITE, `handlers` READ;\n" +
            "DROP TEMPORARY TABLE IF EXISTS `page_ids`;\n" +
            "CREATE TEMPORARY TABLE IF NOT EXISTS `page_ids` (\n" +
            "  `pk` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,\n" +
            "  `id` INT(11) NOT NULL\n" +
            ");\n" +
            "SET SESSION sql_mode = '';\n" +
            "INSERT INTO `page_ids` (`id`) VALUES (97);\n" +
            "SET @sort_order = 1;\n";

        let beginTemplate = "# START\n" +
            "# ------------------------------------\n" +
            "SET @parent_id = (SELECT `id` FROM `page_ids` ORDER BY `pk` DESC LIMIT 1);\n" +
            "SET @current_id = 0;\n" +
            "\n" +
            "SELECT `id` FROM `pages` WHERE `parent` = @parent_id AND `title` = '{{title}}' LIMIT 1 INTO @current_id;\n" +
            "\n" +
            "SET @handler_ID = (SELECT id FROM handlers WHERE `title`= '{{handler}}');\n" +
            "SET @LAST_ID = (SELECT MAX(`id`) + 1 FROM `pages`);\n" +
            "set @stmt = case @current_id\n" +
            "              when 0 then CONCAT(\n" +
            "                  'INSERT INTO `pages` (`id`, `i18n_language`, `title`, `parent`, `handler`, `inmenu`, `insitemap`, `sortorder`) ',\n" +
            "                  '( ',\n" +
            "                  'SELECT ', @LAST_ID, ', L.`id`, ''{{title}}'', ', @parent_id,', ', @handler_ID ,', 1, 1, ', @sort_order, ' ',\n" +
            "                  'FROM `languages` L'\n" +
            "                    ');'\n" +
            "                )\n" +
            "              else 'select ''column already exists, no op'''\n" +
            "  end;\n" +
            "SELECT @stmt;\n" +
            "\n" +
            "PREPARE stmt FROM @stmt;\n" +
            "EXECUTE stmt;\n" +
            "DEALLOCATE PREPARE stmt;\n" +
            "SET @sort_order = @sort_order + 1;\n" +
            "\n" +
            "# ----------- PUSH PARENT\n" +
            "INSERT INTO `page_ids` (`id`) (SELECT IF (@current_id = 0, @LAST_ID, @current_id));\n";

        let endTemplate = "# ------------ POP PARENT\n" +
            "DELETE FROM `page_ids` ORDER BY `pk` DESC LIMIT 1;\n";

        let printNodesSql = function (node) {

            let sql = str_replace('{{title}}', str_replace("'", "\\'", node.name), beginTemplate);
            console.log(node.id);


            for (let i = 0; i < catList.length; i++) {
                if (catList[i].indexOf(node.id) >= 0) {
                    sql = str_replace('{{handler}}', catList[i][0], sql);
                }
            }


            sql += "# ------ CHILDREN\n";
            for (let i = 0, l = node.children.length; i < l; ++i) {

                sql += printNodesSql(node.children[i]);
            }
            sql += "# ------ END CHILDREN\n";
            return sql + endTemplate;
        };

        let nodesSqlText = sqlStart;

        for (let id in nodes) {
            if (nodes.hasOwnProperty(id) && nodes[id].parent === null) {

                if (nodes[id].name != '') {
                    nodesSqlText += printNodesSql(nodes[id]) + "\n";
                }
            }
        }

        nodesSqlText += "UNLOCK TABLES;";

        printResult(nodesSqlText);

    })(jQuery);



    var inputs = document.getElementsByTagName('pre');
    var buttonCopy = document.createElement("input");
    buttonCopy.id = 'Copy';
    buttonCopy.type = 'button';
    buttonCopy.value = 'COPY';
    inputs[inputs.length - 1].firstChild.id = 'sqlText';
    inputs[inputs.length - 1].append(buttonCopy);



    var button = document.getElementById('Copy');
    button.addEventListener('click', function () {



        document.getElementById('sqlText').select();
        // Копируем текст в буфер обмена
        document.execCommand('copy');

        document.getElementById('sqlText').blur()
    });




};

window.onload = function () {
    let mb = document.getElementById("startEx");
    mb.addEventListener("click", start);
}
