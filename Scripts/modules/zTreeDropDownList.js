//该源码由周庆东原创，源码解释权归周庆东所有

(function (global, factory, layui) {
    if (typeof exports === 'object' && typeof module !== 'undefined')// 支持 CommonJS
    {
        module.exports = factory;
    }
    else if (typeof define === 'function' && define.amd)// 支持 AMD
    {
        define(factory);
    }
    else if (window.layui && layui.define)//layui加载
    {
        global.zTreeDropDownList = factory;

        layui.define(['zTreeFuzzySearch'], function (exports) {
            exports('zTreeDropDownList', factory);
        });
    }
    else {
        global.zTreeDropDownList = factory;
    }
}(this, (
    /**
     * zTree树形下拉框
     * @param {any}     treeFields  树字段
     * @param {any}     data        树绑定数据
     * @param {string}  valueId     值控件ID（不为空）
     * @param {string}  displayId   显示控件ID（如果为空，则与ValueId保持一致）
     * @param {boolean} isOpenAll   是否展开全部
     * @param {boolean} isCheck     是否复选
     * @param {any}     chkboxType  复选框关联类型
     */
    function (treeFields, data, valueId, displayId, isOpenAll, isCheck, chkboxType) {
        //值控件ID（不为空）
        var ValueId = valueId;
        //显示控件ID（如果为空，则与ValueId保持一致）
        var DisplayId = displayId || valueId;
        //菜单ID
        var MenuId = DisplayId + "Menu";
        //树ID
        var TreeId = DisplayId + "Tree";
        //是否展开全部
        for (var i in data) {
            var row = data[i];
            row.open = isOpenAll === true;
        }

        //CheckP：选中关联父级（必须）
        //CheckS：选中关联子级（必须）
        //UnCheckP：取消选中关联父级（必须）
        //UnCheckS：取消选中关联子级（必须）
        var ChkboxType = chkboxType || { "CheckP": true, "CheckS": true, "UnCheckP": true, "UnCheckS": true };

        //树字段
        //displayField：显示字段（必须）
        //idField：主键字段（必须）
        //pIdField：父级ID字段（必须）
        //valueField：值字段（如果为空，则与idField保持一致）
        var TreeFields = treeFields || { "displayField": "name", "idField": "id", "pIdField": "pId", "valueField": "id" };
        TreeFields.valueField = TreeFields.valueField || TreeFields.idField;

        //ztree配置参数
        var Setting = {
            callback: {},
            check: {
                enable: isCheck
            },
            view: {
                nameIsHTML: true,//允许name支持html
                selectedMulti: false
            },
            edit: {
                enable: false,
                editNameSelectAll: false
            },
            data: {
                key: {
                    name: TreeFields.displayField
                },
                simpleData: {
                    enable: true,
                    idKey: TreeFields.idField,
                    pIdKey: TreeFields.pIdField,
                    rootPId: 0
                }
            }
        };

        //树绑定数据
        var zNodes = data;

        $("body").append('<div id="' + MenuId + '" style="display:none; position: absolute; z-index:9999; background-color:#fff; border:1px solid #D2D2D2!important;border-radius:2px;min-height:26px;"><ul id="' + TreeId + '" class="ztree" style="margin-top:0;"></ul></div>');

        if (isCheck) {
            $(`<a href="javascript:void(0);" style="width:20px; height:20px; line-height:18px; color:#fff; font-size:14px; font-family:Arial; border-radius:10px; display:block; background-color:#5FB878;text-align:center; vertical-align:middle;transform:scale(-1,1) rotate(310deg);-ms-transform:scale(-1,1) rotate(310deg);-moz-transform:scale(-1,1) rotate(310deg);-webkit-transform:scale(-1,1) rotate(310deg);-o-transform:scale(-1,1) rotate(310deg);text-decoration:none;position:absolute;top:3px; right:3px;">L</a>`).click(function () {
                treeDropDownList.hideMenu();
            }).appendTo($("#" + MenuId).css("min-height", "50px"));
        }

        $(`<a href="javascript:void(0);" style="width:20px; height:20px; color:#fff; font-size:18px; font-family:Arial; border-radius:10px; display:block; background-color:#FF5722;text-align:center; vertical-align:middle;text-decoration:none;position:absolute;bottom:3px; right:3px;">×</a>`).click(function () {
            treeDropDownList.Clear();
            treeDropDownList.hideMenu();
        }).appendTo($("#" + MenuId));

        var treeDropDownList = {
            ValueId: ValueId,
            DisplayId: DisplayId,
            MenuId: MenuId,
            TreeId: TreeId,
            TreeFields: TreeFields,

            //单击节点
            onClick: function (e, treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj(TreeId),
                    nodes = zTree.getSelectedNodes(),
                    v = "";
                nodes.sort(function compare(a, b) { return a.id - b.id; });
                for (var i = 0, l = nodes.length; i < l; i++) {
                    try {
                        v += nodes[i][TreeFields.displayField] + ",";
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (v.length > 0) v = v.substring(0, v.length - 1);
                var obj = $("#" + DisplayId);
                obj.val(v.replace(/<[^>]+>/g, ""));

                if (treeDropDownList.onChange) {
                    treeDropDownList.onChange(treeNode);
                }

                $("#" + ValueId).val(treeNode[TreeFields.valueField]);

                treeDropDownList.hideMenu();
            },

            beforeClick: function (treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj(TreeId);
                zTree.checkNode(treeNode, !treeNode.checked, null, true);
                return false;
            },

            onCheck: function (e, treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj(TreeId),
                    nodes = zTree.getCheckedNodes(true),
                    v = "";

                var v2 = [];
                for (var i = 0; i < nodes.length; i++) {
                    v += nodes[i][TreeFields.displayField] + ",";
                    v2.push(nodes[i][TreeFields.valueField]);
                }
                if (v.length > 0) v = v.substring(0, v.length - 1);

                var obj = $("#" + DisplayId);
                obj.val(v.replace(/<[^>]+>/g, ""));

                $("#" + ValueId).val(v2);
            },

            //选项更改 fn(treeNode)
            onChange: null,

            //清空
            Clear: function () {
                this.SetValue($("#" + ValueId).val(), false)

                $("#" + ValueId).val("");
                $("#" + DisplayId).val("");
            },

            //设置值
            SetValue: function (value, isChecked) {
                isChecked = isChecked !== false ? true : false;
                value = !value ? "" : value.toString().split(",");
                if (value.length > 0) {
                    for (var i in value) {
                        var v = value[i];
                        var nodes = treeDropDownList.zTree.getNodesByParam(TreeFields.valueField, v);
                        if (nodes.length > 0) {
                            var node = nodes[0];
                            if (isCheck) {
                                if ($.inArray(node[TreeFields.valueField].toString(), value) >= 0) {
                                    if (isChecked) {
                                        treeDropDownList.zTree.checkNode(node, isChecked, (ChkboxType.CheckP == ChkboxType.CheckS == ChkboxType.UnCheckP == ChkboxType.UnCheckS), true);
                                    }
                                    else {
                                        node.checked = isChecked;
                                        treeDropDownList.zTree.updateNode(node);
                                    }
                                }
                            }
                            else {
                                $("#" + ValueId).val(node[TreeFields.valueField]);
                                $("#" + DisplayId).val(node[TreeFields.displayField]);
                            }
                        }
                    }
                }
            },

            //显示菜单
            showMenu: function () {
                var obj = $("#" + DisplayId);
                var dOffset = $("#" + DisplayId).offset();

                $("#" + MenuId).css({ left: dOffset.left + "px", top: dOffset.top + obj.outerHeight() + 2 + "px" }).slideDown("fast");
                $("body").bind("mousedown", treeDropDownList.onBodyDown);
            },

            //隐藏菜单
            hideMenu: function () {
                $("#" + MenuId).fadeOut("fast");
                $("body").unbind("mousedown", treeDropDownList.onBodyDown);
            },

            //点击除控件位置
            onBodyDown: function (event) {
                if (!(!event || !event.target || event.target.id == this.DisplayId + "BtnMenu" || event.target.id == MenuId || $(event.target).parents("#" + MenuId).length > 0)) {
                    treeDropDownList.hideMenu();
                }
            }
        }

        if (!isCheck) {
            Setting.callback.onClick = treeDropDownList.onClick;
        }
        else {
            Setting.check.chkboxType = { "Y": (ChkboxType.CheckP ? "p" : "") + (ChkboxType.CheckS ? "s" : ""), "N": (ChkboxType.UnCheckP ? "p" : "") + (ChkboxType.UnCheckS ? "s" : "") };

            Setting.callback.beforeClick = treeDropDownList.beforeClick;
            Setting.callback.onCheck = treeDropDownList.onCheck;
        }
        $.fn.zTree.init($("#" + TreeId), Setting, zNodes);

        //绑定显示控件点击事件
        $("#" + DisplayId).bind("click", treeDropDownList.showMenu);

        if (!$("#" + DisplayId).attr("readonly")) {
            new zTreeFuzzySearch(TreeId, "#" + DisplayId, null, true);//初始化模糊搜索
        }
        else {
            $("#" + DisplayId).css("cursor", "pointer");
        }

        //当前树对象
        treeDropDownList.zTree = $.fn.zTree.getZTreeObj(TreeId);

        return treeDropDownList;
    }), typeof layui == 'undefined' ? null : layui));