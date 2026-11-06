# -*- coding: utf-8 -*-
"""numpy implementation that assigns secondary structure (helix/strand/loop) with the DSSP method (hydrogen-bond energy based)
from the coordinates of the four backbone atoms (N, CA, C, O).
Adapted from the numpy version of pydssp 0.9.1 (https://github.com/ShintaroMinami/PyDSSP, MIT License, Copyright (c) 2022 Shintaro Minami)
to work without einops and a batch dimension. To save memory on large proteins (~2000 residues) it uses per-component (L, L)
arrays instead of an (L, L, 3) array.
"""
import numpy as np

CONST_Q1Q2 = 0.084
CONST_F = 332
DEFAULT_CUTOFF = -0.5
DEFAULT_MARGIN = 1.0


def _unfold(a, window, axis):
    idx = np.arange(window)[:, None] + np.arange(a.shape[axis] - window + 1)[None, :]
    unfolded = np.take(a, idx, axis=axis)
    return np.moveaxis(unfolded, axis - 1, -1)


def _unit(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def _hydrogen(coord):
    vec_cn = _unit(coord[1:, 0] - coord[:-1, 2])
    vec_can = _unit(coord[1:, 0] - coord[1:, 1])
    return coord[1:, 0] + 1.01 * _unit(vec_cn + vec_can)


def _pair_dist(a, b):
    """a[m], b[n] (each (.,3)) -> (m, n) distances"""
    s = 0.0
    for k in range(3):
        s = s + (a[:, None, k] - b[None, :, k]) ** 2
    return np.sqrt(s)


def hbond_map(coord):
    l = coord.shape[0]
    h = _hydrogen(coord)
    n_, c_, o_ = coord[1:, 0], coord[:-1, 2], coord[:-1, 3]
    d_on = _pair_dist(n_, o_)
    d_ch = _pair_dist(h, c_)
    d_oh = _pair_dist(h, o_)
    d_cn = _pair_dist(n_, c_)
    e = np.pad(CONST_Q1Q2 * (1. / d_on + 1. / d_ch - 1. / d_oh - 1. / d_cn) * CONST_F, [[1, 0], [0, 1]])
    local_mask = ~np.eye(l, dtype=bool)
    local_mask &= ~np.diag(np.ones(l - 1, dtype=bool), k=-1)
    local_mask &= ~np.diag(np.ones(l - 2, dtype=bool), k=-2)
    hb = np.clip(DEFAULT_CUTOFF - DEFAULT_MARGIN - e, -DEFAULT_MARGIN, DEFAULT_MARGIN)
    hb = (np.sin(hb / DEFAULT_MARGIN * np.pi / 2) + 1.) / 2
    return hb * local_mask


def assign(coord):
    """coord: (L, 4, 3) [N, CA, C, O]  ->  character array ('-' loop, 'H' helix, 'E' strand), length L"""
    hb = hbond_map(coord).T[None]  # form "i:C=O, j:N-H", batch dimension 1
    turn3 = np.diagonal(hb, axis1=-2, axis2=-1, offset=3) > 0.
    turn4 = np.diagonal(hb, axis1=-2, axis2=-1, offset=4) > 0.
    turn5 = np.diagonal(hb, axis1=-2, axis2=-1, offset=5) > 0.
    h3 = np.pad(turn3[:, :-1] * turn3[:, 1:], [[0, 0], [1, 3]])
    h4 = np.pad(turn4[:, :-1] * turn4[:, 1:], [[0, 0], [1, 4]])
    h5 = np.pad(turn5[:, :-1] * turn5[:, 1:], [[0, 0], [1, 5]])
    helix4 = h4 + np.roll(h4, 1, 1) + np.roll(h4, 2, 1) + np.roll(h4, 3, 1)
    h3 = h3 * ~np.roll(helix4, -1, 1) * ~helix4
    h5 = h5 * ~np.roll(helix4, -1, 1) * ~helix4
    helix3 = h3 + np.roll(h3, 1, 1) + np.roll(h3, 2, 1)
    helix5 = h5 + np.roll(h5, 1, 1) + np.roll(h5, 2, 1) + np.roll(h5, 3, 1) + np.roll(h5, 4, 1)
    unfoldmap = _unfold(_unfold(hb, 3, -2), 3, -2) > 0.
    unfoldmap_rev = np.swapaxes(unfoldmap, 1, 2)
    p_bridge = (unfoldmap[:, :, :, 0, 1] * unfoldmap_rev[:, :, :, 1, 2]) + (unfoldmap_rev[:, :, :, 0, 1] * unfoldmap[:, :, :, 1, 2])
    p_bridge = np.pad(p_bridge, [[0, 0], [1, 1], [1, 1]])
    a_bridge = (unfoldmap[:, :, :, 1, 1] * unfoldmap_rev[:, :, :, 1, 1]) + (unfoldmap[:, :, :, 0, 2] * unfoldmap_rev[:, :, :, 0, 2])
    a_bridge = np.pad(a_bridge, [[0, 0], [1, 1], [1, 1]])
    strand = (p_bridge + a_bridge).sum(-1) > 0
    helix = (helix3 + helix4 + helix5) > 0
    out = np.full(coord.shape[0], '-')
    out[helix[0]] = 'H'
    out[strand[0] & ~helix[0]] = 'E'  # helix takes priority (same as the argmax order in pydssp)
    return out
