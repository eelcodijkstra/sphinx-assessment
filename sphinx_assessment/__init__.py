from pathlib import Path

from sphinx.util import logging
from sphinx.util.fileutil import copy_asset

from .mchoice import setup as mchoice_setup
from .dragndrop import setup as dragndrop_setup
from .fitb import setup as fitb_setup
from .parsons import setup as parsons_setup

logger = logging.getLogger(__name__)


def init_numfig(app, config):
    """Initialize numfig"""

    config["numfig"] = True
    numfig_format = {"assessment": "Toetsvraag %s"}
    # Merge with current sphinx settings
    numfig_format.update(config.numfig_format)
    config.numfig_format = numfig_format


def copy_asset_files(app, exc):
    """ Copies required assets for formating in HTML """

    static_path_css = (
        Path(__file__).parent.joinpath("assets", "css", "assessment.css").absolute()
    )
    static_path_js = (
        Path(__file__).parent.joinpath("assets", "js", "assessment.js").absolute()
    )
    asset_files = [str(static_path_css), str(static_path_js)]

    if exc is None:
        for path in asset_files:
            logger.info("copy: " + str(path))
            logger.info("..to: " + str(Path(app.outdir).joinpath("_static").absolute()))
            copy_asset(path, str(Path(app.outdir).joinpath("_static").absolute()))


def setup(app):

    app.connect("config-inited", init_numfig)  # event order - 1
    app.connect("build-finished", copy_asset_files)  # event order - 16

    mchoice_setup(app)
    dragndrop_setup(app)
    fitb_setup(app)
    parsons_setup(app)

    app.add_css_file("assessment.css")
    app.add_js_file("assessment.js")

    return {
        "version": "0.1",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
