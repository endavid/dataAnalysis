function [veps,vaps,Xc]=LPP(X,W);
% [veps,vaps,m]=LPP(X,W);
%
% 
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
%
% W: the distance matrix.
%    For instance,
%    [ve,va,dc]=LPP(ssv, euclideanComb(w,h,8));
%
% veps: Eigenvectors, ordered by their eigenvalue
% vaps: Eigenvalues, in ascent order
% Xc:   The centered data
%
% To check the how much energy or information we use in our 
% m-dimensional projection:
%   vals = diag(vaps);
%   d=size(vals,1);
%   sum(vals(d-m+1:d))/sum(vals)
%
% Check: scaleSpaceVector, KLPP

[n, d]=size(X);

% center the data
m=mean(X);
Xc = X - ones(n, 1) * m;

D=sparse(diag(sum(W)));
L=D-W;

% generalized eigendecomposition
[veps,vaps]=eig(Xc'*L*Xc,Xc'*D*Xc);
