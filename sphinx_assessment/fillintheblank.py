from docutils import nodes
from docutils.parsers.rst import directives

from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective

logger = logging.getLogger(__name__)


class fillintheblanksnode(nodes.Admonition, nodes.Element):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class blanknode(nodes.Inline, nodes.TextElement):
    pass


class FitbQuestion(nodes.General, nodes.Element):
    pass


class FitbAnswerList(nodes.General, nodes.bullet_list):
    pass


class FitbAnswerItem(nodes.General, nodes.Element):
    pass


class FitbFeedbackList(nodes.General, nodes.bullet_list):
    pass


class FitbFeedbackItem(nodes.General, nodes.Element):
    pass


activeFITB = None


# see: https://docutils.sourceforge.io/docs/howto/rst-roles.html
# for arguments and result
def blankrole(
    name, rawtext, text, lineno, inliner, options={}, content=[],
):
    global activeFITB

    bnode = blanknode(rawtext)
    bnode.line = lineno
    bnode.blankanswer = text
    bnode.blankanswer2 = ""
    _, _, blanktype = name.partition("-")
    if blanktype == "":
        blanktype = "text"

    if blanktype == "range":
        min, _, max = text.partition("..")
        bnode.blankanswer = min
        bnode.blankanswer2 = max

    bnode.blanktype = blanktype

    if activeFITB is not None:
        bnode.fitbnr = activeFITB.fitbnr
        bnode.blanknr = len(activeFITB.blanks)
        activeFITB.blanks.append(bnode)

    return [bnode], []


class FillInTheBlanksDirective(SphinxDirective):
    has_content = True
    optional_arguments = 1  # title
    required_arguments = 0
    final_argument_whitespace = True
    option_spec = {
        "random": directives.flag,
    }

    def run(self):
        global activeFITB

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

        self.blanks = []
        self.fitbnr = self.env.new_serialno("fillintheblank")
        activeFITB = self
        content_node = nodes.section(ids=["question"])  # question-part
        self.state.nested_parse(self.content, self.content_offset, content_node)

        if not (
            len(content_node) > 0 and isinstance(content_node[-1], nodes.bullet_list)
        ):
            raise self.error("fill in the blanks: answer list missing")

        bulletlist = content_node[-1]  # answer list
        content_node.pop()  # remove bullet list
        answerlist = FitbAnswerList()  # dit moet een node zijn....
        feedbacklist = FitbFeedbackList()  # idem

        itemnames = "abcdefghijklmnopqrstuvwxyz"
        itemnr = 0
        for item in bulletlist:
            feedbackitem = FitbFeedbackItem(
                item.rawsource, *item.children, **item.attributes
            )
            feedbackitem["data-value"] = itemnames[itemnr]
            feedbacklist.append(feedbackitem)

            itemnr += 1

        fitbnode = fillintheblanksnode(rawsource=self.block_text)
        fitbnode.source, fitbnode.line = self.state_machine.get_source_and_line(
            self.lineno
        )

        fitbnode.extend([title_node, content_node, feedbacklist])
        return [fitbnode]


def visit_fitbnode(self, node):
    self.body.append('<div class="fillintheblank admonition">')


def depart_fitbnode(self, node):
    self.body.append('<button class="fitbcheckbutton">Check</button>\n')
    self.body.append("</div>\n")


def visit_fitbquestion(self, node):
    self.body.append('<div class="fitbquestion">\n')


def depart_fitbquestion(self, node):
    self.body.append("</div>\n")


def visit_fitbfeedbackitem(self, node):
    self.body.append('<li data-value="{}">'.format(node["data-value"]))


def depart_fitbfeedbackitem(self, node):
    self.body.append("</li>")


def visit_fitbfeedbacklist(self, node):
    self.body.append('<ul class="fitbfeedbacklist" hidden>\n')


def depart_fitbfeedbacklist(self, node):
    self.body.append("</ul>\n")


def visit_blanknode(self, node):
    self.body.append(
        '<input type="text" class="fitbanswer" id="fitb-answer-{nr}-{bnr}" data-type="{type}" data-answer="{answer}" data-answer2="{answer2}"></input>'.format(
            nr=node.fitbnr,
            bnr=node.blanknr,
            type=node.blanktype,
            answer=node.blankanswer,
            answer2=node.blankanswer2,
        )
    )


def depart_blanknode(self, node):
    pass


def setup(app):
    app.add_directive("fillintheblank", FillInTheBlanksDirective)
    app.add_role("blank", blankrole)
    app.add_role("blank-range", blankrole)
    app.add_role("blank-regexp", blankrole)

    app.add_enumerable_node(
        fillintheblanksnode,
        "assessment",
        None,
        html=(visit_fitbnode, depart_fitbnode),
        singlehtml=(visit_fitbnode, depart_fitbnode),
    )
    app.add_node(
        FitbQuestion,
        html=(visit_fitbquestion, depart_fitbquestion),
        singlehtml=(visit_fitbquestion, depart_fitbquestion),
    )
    app.add_node(
        FitbFeedbackList,
        html=(visit_fitbfeedbacklist, depart_fitbfeedbacklist),
        singlehtml=(visit_fitbfeedbacklist, depart_fitbfeedbacklist),
    )
    app.add_node(
        FitbFeedbackItem,
        html=(visit_fitbfeedbackitem, depart_fitbfeedbackitem),
        singlehtml=(visit_fitbfeedbackitem, depart_fitbfeedbackitem),
    )
    app.add_node(
        blanknode,
        html=(visit_blanknode, depart_blanknode),
        singlehtml=(visit_blanknode, depart_blanknode),
    )

    return {
        "version": "0.1",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
