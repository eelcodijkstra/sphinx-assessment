from docutils import nodes
from docutils.parsers.rst import directives

from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective

logger = logging.getLogger(__name__)


class shortanswernode(nodes.Admonition, nodes.Element):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class ShortAnswerDirective(SphinxDirective):
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

        self.shortanswernr = self.env.new_serialno("shortanswer")

        content_node = nodes.section(ids=["question"])  # question-part
        self.state.nested_parse(self.content, self.content_offset, content_node)
        
        sanode = shortanswernode(rawsource=self.block_text)
        sanode.source, sanode.line = self.state_machine.get_source_and_line(
            self.lineno
        )

        sanode.extend([title_node, content_node])
        sanode["label"] = f'assessment-{self.env.new_serialno()}'        
        return [sanode]


def visit_shortanswernode(self, node):
    self.body.append(
        '<div class="{}" id="{}">'.format(
            'shortanswer assessment admonition',
            node["label"]
        )
    )


def depart_shortanswernode(self, node):
    self.body.append('<textarea name="answer" rows="3" cols="40"></textarea><br>');
    self.body.append('<button class="sacheckbutton">Submit</button>\n')
    self.body.append("</div>\n")


def setup(app):
    app.add_directive("shortanswer", ShortAnswerDirective)

    app.add_enumerable_node(
        shortanswernode,
        "assessment",
        None,
        html=(visit_shortanswernode, depart_shortanswernode),
        singlehtml=(visit_shortanswernode, depart_shortanswernode),
    )

    return {
        "version": "0.1",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }

