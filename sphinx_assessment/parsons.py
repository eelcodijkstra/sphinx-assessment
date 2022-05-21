from docutils import nodes
from docutils.parsers.rst import directives

from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective

from .utils import randomize

logger = logging.getLogger(__name__)


class parsonsnode(nodes.Admonition, nodes.Element):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class ParsonsQuestion(nodes.General, nodes.Element):
    pass


class ParsonsList(nodes.General, nodes.bullet_list):
    pass


class ParsonsItem(nodes.General, nodes.Element):
    pass


class ParsonsDirective(SphinxDirective):
    has_content = True
    optional_arguments = 1  # title
    required_arguments = 0
    final_argument_whitespace = True
    option_spec = {
        "random": directives.flag,
    }

    def run(self):

        # Parse custom subtitle option
        if self.arguments != []:
            title_node = nodes.title(text="")
            subtitle = nodes.inline()
            subtitle_text = f" - {self.arguments[0]}"
            subtitle_nodes, _ = self.state.inline_text(subtitle_text, self.lineno)
            subtitle.extend(subtitle_nodes)
            title_node += subtitle
        else:
            title_node = nodes.title(text=" ")

        content_node = nodes.section(ids=["question"])  # question-part
        self.state.nested_parse(self.content, self.content_offset, content_node)

        if not (
            len(content_node) > 0 and isinstance(content_node[-1], nodes.literal_block)
        ):
            raise self.error("parsons: code block missing")

        codeblock = content_node[-1]
        content_node.pop()  # remove from content

        sourcelist = ParsonsList()  # dit moet een node zijn....

        text = codeblock.astext()

        parsonsnr = self.env.new_serialno("parsons")
        itemnr = 1
        sourcelines = text.splitlines()
        for line in sourcelines:
            strippedline = line.lstrip()
            spaces = len(line) - len(strippedline)
            item = ParsonsItem(strippedline)  # rawsource?
            item["data-indent"] = spaces // 4
            item["data-value"] = itemnr
            item["ids"].append("parsons-{}-{}".format(parsonsnr, itemnr))
            itemnr += 1
            sourcelist.append(item)

        randomize(sourcelist)

        pnode = parsonsnode(rawsource=self.block_text)
        parsonsnode.source, parsonsnode.line = self.state_machine.get_source_and_line(
            self.lineno
        )

        pnode.extend([title_node, content_node, sourcelist])
        pnode["parsons-title"] = self.arguments[0]

        return [pnode]


def visit_parsonsnode(self, node):
    self.body.append('<div class="parsons admonition">')


def depart_parsonsnode(self, node):
    self.body.append('<button class="parsons-checkbutton">Check</button>')
    self.body.append("</div>\n")


def visit_parsonsquestion(self, node):
    self.body.append('<div class="parsonsquestion">\n')


def depart_parsonsquestion(self, node):
    self.body.append("</div>\n\n\n")


def visit_parsonsitem(self, node):
    self.body.append(
        '<div class="parsons-item" draggable="true" id="{id}" data-value="{a}" data-indent="{b}">\n'.format(
            a=node["data-value"], b=node["data-indent"], id=node["ids"][0]
        )
    )
    self.body.append(node.rawsource)


def depart_parsonsitem(self, node):
    self.body.append("</div>\n")


def visit_parsonslist(self, node):
    self.body.append('<div class="parsons-container">\n<div class="parsons-source">\n')


def depart_parsonslist(self, node):
    template = """
    <div class="parsons-target">
      <div class="parsons-column1"> </div>
      <div class="parsons-column2"> </div>
      <div class="parsons-column3"> </div>
    </div>
    """
    self.body.append("</div>\n")
    self.body.append(template)
    self.body.append("</div>\n")


def setup(app):
    app.add_directive("parsons", ParsonsDirective)

    app.add_enumerable_node(
        parsonsnode,
        "assessment",
        None,
        html=(visit_parsonsnode, depart_parsonsnode),
        singlehtml=(visit_parsonsnode, depart_parsonsnode),
    )
    app.add_node(
        ParsonsQuestion,
        html=(visit_parsonsquestion, depart_parsonsquestion),
        singlehtml=(visit_parsonsquestion, depart_parsonsquestion),
    )
    app.add_node(
        ParsonsItem,
        html=(visit_parsonsitem, depart_parsonsitem),
        singlehtml=(visit_parsonsitem, depart_parsonsitem),
    )
    app.add_node(
        ParsonsList,
        html=(visit_parsonslist, depart_parsonslist),
        singlehtml=(visit_parsonslist, depart_parsonslist),
    )

    return {
        "version": "0.1",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
